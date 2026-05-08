from __future__ import annotations

import datetime as dt

from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BudgetModel(Base):
    __tablename__ = "budgets"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )
    user_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False,
        index=True,
    )
    month: Mapped[str] = mapped_column(
        String(7),
        nullable=False,
        index=True,
    )
    amount_limit: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )
    created_at: Mapped[dt.date] = mapped_column(
        Date,
        nullable=False,
        default=dt.date.today,
    )

    category: Mapped["CategoryModel"] = relationship()
