import datetime as dt

from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryResponse


FrequencyType = Literal["daily", "weekly", "monthly", "yearly"]


class RecurringTransactionCreate(BaseModel):
    description: str
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    type: Literal["income", "expense"]
    category_id: int
    frequency: FrequencyType
    start_date: dt.date
    end_date: dt.date | None = None


class RecurringTransactionUpdate(BaseModel):
    description: str
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    type: Literal["income", "expense"]
    category_id: int
    frequency: FrequencyType
    start_date: dt.date
    end_date: dt.date | None = None
    is_active: bool


class RecurringTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    amount: Decimal
    type: Literal["income", "expense"]
    category_id: int
    frequency: FrequencyType
    start_date: dt.date
    end_date: dt.date | None
    next_occurrence: dt.date
    is_active: bool
    last_generated: dt.date | None


class RecurringTransactionWithCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    amount: Decimal
    type: Literal["income", "expense"]
    category_id: int
    category: CategoryResponse
    frequency: FrequencyType
    start_date: dt.date
    end_date: dt.date | None
    next_occurrence: dt.date
    is_active: bool
    last_generated: dt.date | None


class ProcessRecurringResult(BaseModel):
    processed_count: int
    transactions_created: int
