from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    HTTPException,
    Query,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from typing import List, Optional

import math
import random
import string
import os
import secrets

import models
import schemas
import auth
import database
import emailer

# Set these as environment variables on the server (see README / notes):
#   ADMIN_SIGNUP_CODE  secret code required to register an admin account
#   FRONTEND_URL       public URL of the frontend (used in reset-password emails)
ADMIN_SIGNUP_CODE = os.getenv("ADMIN_SIGNUP_CODE")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")


# =========================================================
# DATABASE
# =========================================================

models.Base.metadata.create_all(
    bind=database.engine
)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Courier & Logistics Management System",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://courier-management-system01.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Courier & Logistics API is running",
        "status": "success",
    }


# =========================================================
# TRACKING CODE
# =========================================================

def generate_tracking_code():
    chars = string.ascii_uppercase + string.digits

    random_part = "".join(
        random.choices(
            chars,
            k=8,
        )
    )

    return f"TRK-{random_part}"


# =========================================================
# AUTH ENDPOINTS
# =========================================================

@app.post(
    "/signup",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    user: schemas.UserCreate,
    db: Session = Depends(database.get_db),
):
    # Admin signup protection
    if (user.role or "user") == "admin":
        if not ADMIN_SIGNUP_CODE:
            raise HTTPException(
                status_code=403,
                detail="Admin signup is currently disabled",
            )

        provided = (user.admin_code or "").encode()

        if not secrets.compare_digest(
            provided,
            ADMIN_SIGNUP_CODE.encode(),
        ):
            raise HTTPException(
                status_code=403,
                detail="Invalid admin secret code",
            )

    # Check username
    existing_username = (
        db.query(models.User)
        .filter(
            models.User.username == user.username
        )
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already registered",
        )

    # Check email
    existing_email = (
        db.query(models.User)
        .filter(
            models.User.email == user.email
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    # Validate password
    if len(user.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters",
        )

    # Validate role
    role = user.role or "user"

    if role not in ["user", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role",
        )

    # Hash password
    hashed_password = auth.get_password_hash(
        user.password
    )

    # Create user
    new_user = models.User(
        username=user.username.strip(),
        email=str(user.email).lower().strip(),
        hashed_password=hashed_password,
        role=role,
    )

    db.add(new_user)

    try:
        db.commit()
        db.refresh(new_user)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not create account",
        )

    return new_user


# =========================================================
# LOGIN
# =========================================================

@app.post(
    "/login",
    response_model=schemas.TokenResponse,
)
def login(
    user_credentials: schemas.UserLogin,
    db: Session = Depends(database.get_db),
):
    username = user_credentials.username.strip()

    user = (
        db.query(models.User)
        .filter(
            models.User.username == username
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    if not auth.verify_password(
        user_credentials.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    access_token = auth.create_access_token(
        data={
            "sub": user.username,
            "role": user.role,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role,
    }


# =========================================================
# FORGOT PASSWORD
# =========================================================

@app.post("/forgot-password")
def forgot_password(
    request: schemas.ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
):
    email = str(request.email).lower().strip()

    user = (
        db.query(models.User)
        .filter(func.lower(models.User.email) == email)
        .first()
    )

    if user:
        token = auth.create_reset_token(user)
        link = f"{FRONTEND_URL}/reset-password?token={token}"

        # sent in the background so the response is instant
        background_tasks.add_task(
            emailer.send_password_reset,
            user.email,
            user.username,
            link,
        )

    # Same answer whether or not the email exists (prevents account probing)
    return {
        "message": "If an account with that email exists, a password reset link has been sent."
    }


# =========================================================
# RESET PASSWORD
# =========================================================

@app.post("/reset-password")
def reset_password(
    payload: schemas.ResetPasswordRequest,
    db: Session = Depends(database.get_db),
):
    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters",
        )

    user = auth.verify_reset_token(payload.token, db)

    if not user:
        raise HTTPException(
            status_code=400,
            detail="This reset link is invalid or has expired. Please request a new one.",
        )

    user.hashed_password = auth.get_password_hash(
        payload.new_password
    )

    db.commit()

    return {
        "message": "Password updated successfully. You can now log in."
    }


# =========================================================
# USER PARCELS
# =========================================================

@app.post(
    "/parcels/book",
    response_model=schemas.ParcelResponse,
    status_code=status.HTTP_201_CREATED,
)
def book_parcel(
    parcel: schemas.ParcelCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_current_user
    ),
):
    if parcel.weight_kg <= 0:
        raise HTTPException(
            status_code=400,
            detail="Weight must be greater than 0",
        )

    charge = 60.0 + (
        parcel.weight_kg * 20.0
    )

    tracking_code = generate_tracking_code()

    new_parcel = models.Parcel(
        tracking_code=tracking_code,
        title=parcel.title,
        receiver_name=parcel.receiver_name,
        receiver_phone=parcel.receiver_phone,
        delivery_address=parcel.delivery_address,
        category=parcel.category,
        weight_kg=parcel.weight_kg,
        delivery_charge=charge,
        sender_id=current_user.id,
        status="Pending",
    )

    db.add(new_parcel)

    try:
        db.commit()
        db.refresh(new_parcel)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Could not book parcel",
        )

    return new_parcel


# =========================================================
# MY PARCELS
# =========================================================

@app.get(
    "/parcels/my",
    response_model=List[schemas.ParcelResponse],
)
def get_my_parcels(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_current_user
    ),
):
    return (
        db.query(models.Parcel)
        .filter(
            models.Parcel.sender_id
            == current_user.id
        )
        .order_by(
            models.Parcel.created_at.desc()
        )
        .all()
    )


# =========================================================
# TRACK PARCEL
# =========================================================

@app.get(
    "/parcels/track/{tracking_code}",
    response_model=schemas.ParcelResponse,
)
def track_parcel(
    tracking_code: str,
    db: Session = Depends(database.get_db),
):
    parcel = (
        db.query(models.Parcel)
        .filter(
            models.Parcel.tracking_code
            == tracking_code
        )
        .first()
    )

    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel with this tracking code was not found",
        )

    return parcel


# =========================================================
# CANCEL PARCEL
# =========================================================

@app.put(
    "/parcels/cancel/{parcel_id}",
    response_model=schemas.ParcelResponse,
)
def cancel_parcel(
    parcel_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_current_user
    ),
):
    parcel = (
        db.query(models.Parcel)
        .filter(
            models.Parcel.id == parcel_id,
            models.Parcel.sender_id
            == current_user.id,
        )
        .first()
    )

    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found",
        )

    if parcel.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel parcel once it is processed or delivered",
        )

    parcel.status = "Cancelled"

    db.commit()
    db.refresh(parcel)

    return parcel


# =========================================================
# ADMIN - GET PARCELS
# =========================================================

@app.get(
    "/admin/parcels",
    response_model=schemas.PaginatedParcelsResponse,
)
def admin_get_parcels(
    search: Optional[str] = "",
    category: Optional[str] = "All",
    status_filter: Optional[str] = Query(
        "All",
        alias="status",
    ),
    sort_by: Optional[str] = "newest",
    page: int = Query(
        1,
        ge=1,
    ),
    size: int = Query(
        8,
        ge=1,
    ),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_admin_user
    ),
):
    query = db.query(models.Parcel)

    # Search
    if search:
        search_fmt = f"%{search}%"

        query = query.filter(
            (models.Parcel.title.ilike(search_fmt))
            |
            (
                models.Parcel.receiver_name.ilike(
                    search_fmt
                )
            )
            |
            (
                models.Parcel.tracking_code.ilike(
                    search_fmt
                )
            )
        )

    # Category
    if category and category != "All":
        query = query.filter(
            models.Parcel.category == category
        )

    # Status
    if (
        status_filter
        and status_filter != "All"
    ):
        query = query.filter(
            models.Parcel.status
            == status_filter
        )

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(
            models.Parcel.created_at.asc()
        )

    elif sort_by == "price_low":
        query = query.order_by(
            models.Parcel.delivery_charge.asc()
        )

    elif sort_by == "price_high":
        query = query.order_by(
            models.Parcel.delivery_charge.desc()
        )

    elif sort_by == "weight":
        query = query.order_by(
            models.Parcel.weight_kg.desc()
        )

    else:
        query = query.order_by(
            models.Parcel.created_at.desc()
        )

    total = query.count()

    total_pages = (
        math.ceil(total / size)
        if total > 0
        else 1
    )

    parcels = (
        query
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    return {
        "parcels": parcels,
        "total": total,
        "page": page,
        "size": size,
        "total_pages": total_pages,
    }


# =========================================================
# ADMIN - UPDATE PARCEL STATUS
# =========================================================

@app.put(
    "/admin/parcels/{parcel_id}/status",
    response_model=schemas.ParcelResponse,
)
def update_parcel_status(
    parcel_id: int,
    status_update: schemas.StatusUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_admin_user
    ),
):
    allowed_statuses = [
        "Pending",
        "Picked Up",
        "In Transit",
        "Delivered",
        "Cancelled",
    ]

    if status_update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid parcel status",
        )

    parcel = (
        db.query(models.Parcel)
        .filter(
            models.Parcel.id == parcel_id
        )
        .first()
    )

    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found",
        )

    parcel.status = status_update.status

    db.commit()
    db.refresh(parcel)

    return parcel


# =========================================================
# ADMIN - DELETE PARCEL
# =========================================================

@app.delete(
    "/admin/parcels/{parcel_id}"
)
def delete_parcel(
    parcel_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(
        auth.get_admin_user
    ),
):
    parcel = (
        db.query(models.Parcel)
        .filter(
            models.Parcel.id == parcel_id
        )
        .first()
    )

    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found",
        )

    db.delete(parcel)
    db.commit()

    return {
        "message": "Parcel deleted successfully"
    }