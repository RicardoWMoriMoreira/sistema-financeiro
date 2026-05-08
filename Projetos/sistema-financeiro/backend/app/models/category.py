from __future__ import annotations

from typing import Optional

from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CategoryModel(Base):
    __tablename__ = "categories"

    __table_args__ = (
        UniqueConstraint("name", "type", "user_id", name="uq_categories_name_type_user_id"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    transactions: Mapped[list["TransactionModel"]] = relationship(
        back_populates="category",
    )
    user: Mapped[Optional["UserModel"]] = relationship()