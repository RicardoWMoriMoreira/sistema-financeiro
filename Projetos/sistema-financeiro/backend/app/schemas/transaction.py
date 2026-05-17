import datetime as dt

from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryResponse
from app.schemas.credit_card import CreditCardResponse

PaymentMethod = Literal["credit_card", "debit_card", "cash", "pix"]
SpendingProfile = Literal["fixed", "variable"]
PaymentStatus = Literal["paid", "pending"]


class TransactionCreate(BaseModel):
    description: str
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    type: Literal["income", "expense"]
    payment_method: PaymentMethod = "pix"
    spending_profile: SpendingProfile = "variable"
    due_date: dt.date | None = None
    payment_status: PaymentStatus = "paid"
    installment_group_id: str | None = None
    installment_number: int = Field(default=1, ge=1, le=360)
    installment_total: int = Field(default=1, ge=1, le=360)
    category_id: int
    credit_card_id: int | None = None
    date: dt.date


class TransactionUpdate(BaseModel):
    description: str
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    type: Literal["income", "expense"]
    payment_method: PaymentMethod = "pix"
    spending_profile: SpendingProfile = "variable"
    due_date: dt.date | None = None
    payment_status: PaymentStatus = "paid"
    installment_group_id: str | None = None
    installment_number: int = Field(default=1, ge=1, le=360)
    installment_total: int = Field(default=1, ge=1, le=360)
    category_id: int
    credit_card_id: int | None = None
    date: dt.date


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    amount: Decimal
    type: Literal["income", "expense"]
    payment_method: PaymentMethod
    spending_profile: SpendingProfile
    due_date: dt.date | None
    payment_status: PaymentStatus
    installment_group_id: str | None
    installment_number: int
    installment_total: int
    category_id: int
    credit_card_id: int | None
    date: dt.date


class TransactionWithCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    amount: Decimal
    type: Literal["income", "expense"]
    payment_method: PaymentMethod
    spending_profile: SpendingProfile
    due_date: dt.date | None
    payment_status: PaymentStatus
    installment_group_id: str | None
    installment_number: int
    installment_total: int
    category_id: int
    category: CategoryResponse
    credit_card_id: int | None
    credit_card: CreditCardResponse | None
    date: dt.date


class TransactionSummary(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal


class TransactionStatusCountsResponse(BaseModel):
    paid: int
    pending: int
    total: int


class TransactionGroupActionResponse(BaseModel):
    group_id: str
    affected: int
    message: str


class PaginatedTransactionsResponse(BaseModel):
    items: list[TransactionWithCategoryResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class CsvImportResult(BaseModel):
    imported: int
    failed: int
    errors: list[str]


class TransactionHistoryItem(BaseModel):
    period: str
    income: Decimal
    expense: Decimal
    balance: Decimal


class TransactionHistoryResponse(BaseModel):
    items: list[TransactionHistoryItem]
    group_by: Literal["day", "week", "month"]
    period: str