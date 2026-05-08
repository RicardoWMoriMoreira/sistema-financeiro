import datetime as dt

from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class GoalCreate(BaseModel):
    user_id: Optional[int] = None
    name: str
    target_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    current_amount: Decimal = Field(ge=0, max_digits=12, decimal_places=2, default=Decimal("0.00"))
    deadline: dt.date
    type: Literal["saving", "spending"]


class GoalUpdate(BaseModel):
    name: str
    target_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    current_amount: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    deadline: dt.date
    type: Literal["saving", "spending"]
    status: Literal["active", "completed", "failed"]


class GoalUpdateAmount(BaseModel):
    current_amount: Decimal = Field(ge=0, max_digits=12, decimal_places=2)


class GoalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    name: str
    target_amount: Decimal
    current_amount: Decimal
    deadline: dt.date
    type: Literal["saving", "spending"]
    status: Literal["active", "completed", "failed"]
    created_at: dt.date


class GoalProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    target_amount: Decimal
    current_amount: Decimal
    deadline: dt.date
    type: Literal["saving", "spending"]
    status: Literal["active", "completed", "failed"]
    progress_percentage: Decimal
    remaining_amount: Decimal
    days_remaining: int
    is_on_track: bool


class GoalsSummary(BaseModel):
    total_goals: int
    active_goals: int
    completed_goals: int
    failed_goals: int
    total_target: Decimal
    total_current: Decimal
    overall_progress: Decimal
