from __future__ import annotations

import datetime as dt

from decimal import Decimal

from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RecurringTransactionModel(Base):
    __tablename__ = "recurring_transactions"

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
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False,
        index=True,
    )
    frequency: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    start_date: Mapped[dt.date] = mapped_column(
        Date,
        nullable=False,
    )
    end_date: Mapped[dt.date | None] = mapped_column(
        Date,
        nullable=True,
    )
    next_occurrence: Mapped[dt.date] = mapped_column(
        Date,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    last_generated: Mapped[dt.date | None] = mapped_column(
        Date,
        nullable=True,
    )

    category: Mapped["CategoryModel"] = relationship()
