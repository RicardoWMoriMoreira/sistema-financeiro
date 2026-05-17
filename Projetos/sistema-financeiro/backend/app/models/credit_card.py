from __future__ import annotations

import datetime as dt

from typing import Optional

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CreditCardModel(Base):
    __tablename__ = "credit_cards"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )
    brand: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="outro",
    )
    last_four: Mapped[str] = mapped_column(
        String(4),
        nullable=False,
    )
    closing_day: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    due_day: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    created_at: Mapped[dt.date] = mapped_column(
        Date,
        nullable=False,
        default=dt.date.today,
    )
