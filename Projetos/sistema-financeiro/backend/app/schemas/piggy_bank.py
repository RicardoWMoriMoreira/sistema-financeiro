import datetime as dt

from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PiggyBankCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None
    target_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    current_amount: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=12, decimal_places=2)


class PiggyBankUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None
    target_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    current_amount: Decimal = Field(ge=0, max_digits=12, decimal_places=2)


class PiggyBankBalanceUpdate(BaseModel):
    amount_delta: Decimal = Field(max_digits=12, decimal_places=2)


class PiggyBankResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    target_amount: Decimal
    current_amount: Decimal
    progress_percentage: Decimal
    remaining_amount: Decimal
    created_at: dt.date
