import datetime as dt

from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryResponse


class BudgetCreate(BaseModel):
    user_id: Optional[int] = None
    category_id: int
    month: str = Field(pattern=r"^\d{4}-\d{2}$")
    amount_limit: Decimal = Field(gt=0, max_digits=12, decimal_places=2)


class BudgetUpdate(BaseModel):
    category_id: int
    month: str = Field(pattern=r"^\d{4}-\d{2}$")
    amount_limit: Decimal = Field(gt=0, max_digits=12, decimal_places=2)


class BudgetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    category_id: int
    month: str
    amount_limit: Decimal
    created_at: dt.date


class BudgetWithCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    category_id: int
    category: CategoryResponse
    month: str
    amount_limit: Decimal
    created_at: dt.date


class BudgetStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_id: int
    category: CategoryResponse
    month: str
    amount_limit: Decimal
    amount_spent: Decimal
    remaining: Decimal
    percentage_used: Decimal
    is_exceeded: bool
