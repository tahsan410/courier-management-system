from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime


# =========================================================
# USER SCHEMAS
# =========================================================

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# =========================================================
# PARCEL SCHEMAS
# =========================================================

class ParcelCreate(BaseModel):
    title: str
    receiver_name: str
    receiver_phone: str
    delivery_address: str
    category: str
    weight_kg: float


class StatusUpdate(BaseModel):
    status: str


class ParcelResponse(BaseModel):
    id: int
    tracking_code: str
    title: str
    receiver_name: str
    receiver_phone: str
    delivery_address: str
    category: str
    weight_kg: float
    delivery_charge: float
    status: str
    created_at: datetime
    sender_id: int

    model_config = ConfigDict(from_attributes=True)


class PaginatedParcelsResponse(BaseModel):
    parcels: List[ParcelResponse]
    total: int
    page: int
    size: int
    total_pages: int