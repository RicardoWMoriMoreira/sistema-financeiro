from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    type: Literal["income", "expense"]


class CategoryUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    type: Literal["income", "expense"]


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: Literal["income", "expense"]