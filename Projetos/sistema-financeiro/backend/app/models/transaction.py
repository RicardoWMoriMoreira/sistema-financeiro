from __future__ import annotations

import datetime as dt

from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TransactionModel(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )
    description: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )
    type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    payment_method: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pix",
    )
    spending_profile: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="variable",
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False,
        index=True,
    )
    date: Mapped[dt.date] = mapped_column(
        Date,
        nullable=False,
    )
    due_date: Mapped[Optional[dt.date]] = mapped_column(
        Date,
        nullable=True,
    )
    payment_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="paid",
    )
    installment_group_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        nullable=True,
        index=True,
    )
    installment_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )
    installment_total: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    category: Mapped["CategoryModel"] = relationship(
        back_populates="transactions",
    )
    user: Mapped[Optional["UserModel"]] = relationship()