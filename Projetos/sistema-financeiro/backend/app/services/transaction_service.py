import datetime as dt

from decimal import Decimal
from typing import Literal, Optional
from uuid import uuid4

from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session

from app.models.transaction import TransactionModel
from app.repositories import category_repository, transaction_repository
from app.schemas.transaction import (
    PaginatedTransactionsResponse,
    TransactionCreate,
    TransactionGroupActionResponse,
    TransactionHistoryItem,
    TransactionHistoryResponse,
    TransactionStatusCountsResponse,
    TransactionSummary,
    TransactionUpdate,
    TransactionWithCategoryResponse,
)


def to_transaction_response(
    transaction: TransactionModel,
) -> TransactionWithCategoryResponse:
    return TransactionWithCategoryResponse.model_validate(transaction)


def validate_category_for_transaction(
    db: Session,
    transaction_type: Literal["income", "expense"],
    category_id: int,
    user_id: Optional[int] = None,
) -> bool:
    category = category_repository.find_category_by_id(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    if category is None:
        return False

    return category.type == transaction_type


def list_transactions(
    db: Session,
    user_id: Optional[int] = None,
    transaction_type: Optional[Literal["income", "expense"]] = None,
    payment_status: Optional[Literal["paid", "pending"]] = None,
    category_id: Optional[int] = None,
    start_date: Optional[dt.date] = None,
    end_date: Optional[dt.date] = None,
    search: Optional[str] = None,
) -> list[TransactionWithCategoryResponse]:
    transactions = transaction_repository.list_transactions(
        db=db,
        user_id=user_id,
        transaction_type=transaction_type,
        payment_status=payment_status,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )

    return [
        to_transaction_response(transaction)
        for transaction in transactions
    ]


def list_transactions_paginated(
    db: Session,
    user_id: Optional[int] = None,
    page: int = 1,
    per_page: int = 10,
    transaction_type: Optional[Literal["income", "expense"]] = None,
    payment_status: Optional[Literal["paid", "pending"]] = None,
    category_id: Optional[int] = None,
    start_date: Optional[dt.date] = None,
    end_date: Optional[dt.date] = None,
    search: Optional[str] = None,
) -> PaginatedTransactionsResponse:
    transactions, total = transaction_repository.list_transactions_paginated(
        db=db,
        user_id=user_id,
        page=page,
        per_page=per_page,
        transaction_type=transaction_type,
        payment_status=payment_status,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )

    total_pages = (total + per_page - 1) // per_page

    return PaginatedTransactionsResponse(
        items=[to_transaction_response(t) for t in transactions],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


def get_transactions_summary(
    db: Session,
    user_id: Optional[int] = None,
    payment_status: Optional[Literal["paid", "pending"]] = None,
    category_id: Optional[int] = None,
    start_date: Optional[dt.date] = None,
    end_date: Optional[dt.date] = None,
) -> TransactionSummary:
    transactions = transaction_repository.list_transactions(
        db=db,
        user_id=user_id,
        payment_status=payment_status,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
    )

    total_income = sum(
        (
            transaction.amount
            for transaction in transactions
            if transaction.type == "income"
        ),
        Decimal("0.00"),
    )

    total_expense = sum(
        (
            transaction.amount
            for transaction in transactions
            if transaction.type == "expense"
        ),
        Decimal("0.00"),
    )

    balance = total_income - total_expense

    return TransactionSummary(
        total_income=total_income,
        total_expense=total_expense,
        balance=balance,
    )


def get_transaction_status_counts(
    db: Session,
    user_id: Optional[int] = None,
    transaction_type: Optional[Literal["income", "expense"]] = None,
    category_id: Optional[int] = None,
    start_date: Optional[dt.date] = None,
    end_date: Optional[dt.date] = None,
    search: Optional[str] = None,
) -> TransactionStatusCountsResponse:
    transactions = transaction_repository.list_transactions(
        db=db,
        user_id=user_id,
        transaction_type=transaction_type,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )

    paid = sum(1 for transaction in transactions if transaction.payment_status == "paid")
    pending = sum(1 for transaction in transactions if transaction.payment_status == "pending")

    return TransactionStatusCountsResponse(
        paid=paid,
        pending=pending,
        total=len(transactions),
    )


def find_transaction_by_id(
    db: Session,
    transaction_id: int,
    user_id: Optional[int] = None,
) -> Optional[TransactionWithCategoryResponse]:
    transaction = transaction_repository.find_transaction_by_id(
        db=db,
        transaction_id=transaction_id,
        user_id=user_id,
    )

    if transaction is None:
        return None

    return to_transaction_response(transaction)


def create_transaction(
    db: Session,
    transaction: TransactionCreate,
    user_id: Optional[int] = None,
) -> TransactionWithCategoryResponse | None:
    is_valid_category = validate_category_for_transaction(
        db=db,
        transaction_type=transaction.type,
        category_id=transaction.category_id,
        user_id=user_id,
    )

    if not is_valid_category:
        return None

    installment_total = max(1, transaction.installment_total)

    if installment_total == 1:
        new_transaction = transaction_repository.create_transaction(
            db=db,
            transaction=transaction,
            user_id=user_id,
        )
        return to_transaction_response(new_transaction)

    amount_cents = int((transaction.amount * 100).quantize(Decimal("1")))
    base_cents = amount_cents // installment_total
    remainder = amount_cents % installment_total
    installment_group_id = transaction.installment_group_id or str(uuid4())

    first_created: TransactionWithCategoryResponse | None = None
    base_due_date = transaction.due_date or transaction.date

    for index in range(installment_total):
        cents = base_cents + (1 if index < remainder else 0)
        installment_amount = (Decimal(cents) / Decimal(100)).quantize(Decimal("0.01"))
        installment_number = index + 1

        installment_transaction = TransactionCreate(
            description=f"{transaction.description} ({installment_number}/{installment_total})",
            amount=installment_amount,
            type=transaction.type,
            payment_method=transaction.payment_method,
            spending_profile=transaction.spending_profile,
            due_date=base_due_date + relativedelta(months=index),
            payment_status=transaction.payment_status,
            installment_group_id=installment_group_id,
            installment_number=installment_number,
            installment_total=installment_total,
            category_id=transaction.category_id,
            date=transaction.date + relativedelta(months=index),
        )

        created = transaction_repository.create_transaction(
            db=db,
            transaction=installment_transaction,
            user_id=user_id,
        )

        if first_created is None:
            first_created = to_transaction_response(created)

    return first_created


def update_transaction(
    db: Session,
    transaction_id: int,
    transaction_data: TransactionUpdate,
    user_id: Optional[int] = None,
) -> Optional[TransactionWithCategoryResponse]:
    is_valid_category = validate_category_for_transaction(
        db=db,
        transaction_type=transaction_data.type,
        category_id=transaction_data.category_id,
        user_id=user_id,
    )

    if not is_valid_category:
        raise ValueError("Categoria inválida para esta transação")

    transaction = transaction_repository.update_transaction(
        db=db,
        transaction_id=transaction_id,
        transaction_data=transaction_data,
        user_id=user_id,
    )

    if transaction is None:
        return None

    return to_transaction_response(transaction)


def update_installment_group(
    db: Session,
    group_id: str,
    transaction_data: TransactionUpdate,
    user_id: Optional[int] = None,
) -> TransactionGroupActionResponse | None:
    transactions = transaction_repository.find_transactions_by_group_id(
        db=db,
        group_id=group_id,
        user_id=user_id,
    )

    if not transactions:
        return None

    is_valid_category = validate_category_for_transaction(
        db=db,
        transaction_type=transaction_data.type,
        category_id=transaction_data.category_id,
        user_id=user_id,
    )

    if not is_valid_category:
        raise ValueError("Categoria inválida para esta transação")

    first = transactions[0]
    base_due_date = transaction_data.due_date or first.due_date or first.date
    base_date = transaction_data.date

    for transaction in transactions:
        months_offset = max(transaction.installment_number - 1, 0)
        transaction.description = (
            f"{transaction_data.description} "
            f"({transaction.installment_number}/{transaction.installment_total})"
        )
        transaction.amount = transaction_data.amount
        transaction.type = transaction_data.type
        transaction.payment_method = transaction_data.payment_method
        transaction.spending_profile = transaction_data.spending_profile
        transaction.payment_status = transaction_data.payment_status
        transaction.category_id = transaction_data.category_id
        transaction.date = base_date + relativedelta(months=months_offset)
        transaction.due_date = (
            base_due_date + relativedelta(months=months_offset)
            if base_due_date is not None
            else None
        )

    db.commit()

    return TransactionGroupActionResponse(
        group_id=group_id,
        affected=len(transactions),
        message="Parcelas atualizadas com sucesso.",
    )


def mark_installment_group_paid(
    db: Session,
    group_id: str,
    user_id: Optional[int] = None,
) -> TransactionGroupActionResponse | None:
    transactions = transaction_repository.find_transactions_by_group_id(
        db=db,
        group_id=group_id,
        user_id=user_id,
    )

    if not transactions:
        return None

    for transaction in transactions:
        transaction.payment_status = "paid"

    db.commit()

    return TransactionGroupActionResponse(
        group_id=group_id,
        affected=len(transactions),
        message="Parcelas marcadas como pagas.",
    )


def delete_installment_group(
    db: Session,
    group_id: str,
    user_id: Optional[int] = None,
) -> TransactionGroupActionResponse | None:
    affected = transaction_repository.delete_transactions_by_group_id(
        db=db,
        group_id=group_id,
        user_id=user_id,
    )

    if affected == 0:
        return None

    return TransactionGroupActionResponse(
        group_id=group_id,
        affected=affected,
        message="Parcelas removidas com sucesso.",
    )


def delete_transaction(
    db: Session,
    transaction_id: int,
    user_id: Optional[int] = None,
) -> Optional[TransactionWithCategoryResponse]:
    transaction = transaction_repository.delete_transaction(
        db=db,
        transaction_id=transaction_id,
        user_id=user_id,
    )

    if transaction is None:
        return None

    return to_transaction_response(transaction)


def get_transactions_history(
    db: Session,
    user_id: Optional[int] = None,
    period: Literal["6m", "12m", "ytd", "all"] = "6m",
    group_by: Literal["day", "week", "month"] = "month",
) -> TransactionHistoryResponse:
    today = dt.date.today()

    if period == "6m":
        start_date = today - dt.timedelta(days=180)
    elif period == "12m":
        start_date = today - dt.timedelta(days=365)
    elif period == "ytd":
        start_date = dt.date(today.year, 1, 1)
    else:
        start_date = dt.date(2000, 1, 1)

    history = transaction_repository.get_transactions_history(
        db=db,
        user_id=user_id,
        start_date=start_date,
        end_date=today,
        group_by=group_by,
    )

    items = [
        TransactionHistoryItem(
            period=item["period"],
            income=item["income"],
            expense=item["expense"],
            balance=item["balance"],
        )
        for item in history
    ]

    return TransactionHistoryResponse(
        items=items,
        group_by=group_by,
        period=period,
    )