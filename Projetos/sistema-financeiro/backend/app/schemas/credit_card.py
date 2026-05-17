import datetime as dt

from pydantic import BaseModel, ConfigDict, Field


class CreditCardCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    brand: str = Field(default="outro", min_length=2, max_length=50)
    last_four: str = Field(pattern=r"^\d{4}$")
    closing_day: int = Field(ge=1, le=31)
    due_day: int = Field(ge=1, le=31)


class CreditCardUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    brand: str = Field(default="outro", min_length=2, max_length=50)
    last_four: str = Field(pattern=r"^\d{4}$")
    closing_day: int = Field(ge=1, le=31)
    due_day: int = Field(ge=1, le=31)
    is_active: bool


class CreditCardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    brand: str
    last_four: str
    closing_day: int
    due_day: int
    is_active: bool
    created_at: dt.date
