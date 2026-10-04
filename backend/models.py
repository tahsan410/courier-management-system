from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password = Column(
        String,
        nullable=False,
    )

    role = Column(
        String,
        default="user",
        nullable=False,
    )

    parcels = relationship(
        "Parcel",
        back_populates="sender",
        cascade="all, delete-orphan",
    )


class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    tracking_code = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    title = Column(
        String,
        nullable=False,
    )

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    receiver_name = Column(
        String,
        nullable=False,
    )

    receiver_phone = Column(
        String,
        nullable=False,
    )

    delivery_address = Column(
        String,
        nullable=False,
    )

    category = Column(
        String,
        nullable=False,
    )

    weight_kg = Column(
        Float,
        nullable=False,
    )

    delivery_charge = Column(
        Float,
        nullable=False,
    )

    status = Column(
        String,
        default="Pending",
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    sender = relationship(
        "User",
        back_populates="parcels",
    )