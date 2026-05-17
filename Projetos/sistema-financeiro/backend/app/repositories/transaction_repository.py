import datetime as dt

from collections import defaultdict
from decimal import Decimal
from typing import Literal, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.transaction import TransactionModel
from app.schemas.transaction import TransactionCreate, TransactionUpdate


def _build_base_query(
    user_id: Optional[int] = None,
    transaction_type: Optional[Literal["income", "expense"]] = None,
    payment_status: Optional[Literal["paid", "pending"]] = None,
    category_id: Optional[int] = None,
    start_date: Optional[dt.date] = None,
    end_date: Optional[dt.date] = None,
    search: Optional[str] = None,
):
    statement = select(TransactionModel)

    if user_id is not None:
        statement = statement.where(TransactionModel.user_id == user_id)

    if transaction_type is not None:
        statement = statement.where(TransactionModel.type == transaction_type)

    if payment_status is not None:
        statement = statement.where(TransactionModel.payment_status == payment_status)

    if category_id is not None:
        statement = statement.where(TransactionModel.category_id == category_id)

    if start_date is not None:
        statement = statement.where(TransactionModel.date >= start_date)

    if end_date is not None:
        statement = statement.where(TransactionModel.date <= end_date)

    if search is not None:
        statement = statement.where(
            TransactionModel.description.ilike(f"%{search}%")
        )

    return statement


def list_transactions(
    db: Session,
    user_id: Optional[int] = None,
    transaction_type: Optional[Literal["income", "expense"]] = None,
    payment_status: Optional[Literal["paid", "pending"]] = None,
    category_id: Optional[int] = None,
    start_date: Optional[dt.date] = None,
    end_date: Optional[dt.date] = None,
    search: Optional[str] = None,
) -> list[TransactionModel]:
    statement = _build_base_query(
        user_id=user_id,
        transaction_type=transaction_type,
        payment_status=payment_status,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    ).options(selectinload(TransactionModel.category))
    statement = statement.options(selectinload(TransactionModel.credit_card))

    statement = statement.order_by(
        TransactionModel.date.desc(),
        TransactionModel.id.desc(),
    )

    return list(db.scalars(statement).all())


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
) -> Tuple[list[TransactionModel], int]:
    base_query = _build_base_query(
        user_id=user_id,
        transaction_type=transaction_type,
        payment_status=payment_status,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )

    count_statement = select(func.count()).select_from(base_query.subquery())
    total = db.scalar(count_statement) or 0

    offset = (page - 1) * per_page
    statement = (
        base_query
        .options(selectinload(TransactionModel.category))
        .options(selectinload(TransactionModel.credit_card))
        .order_by(
            TransactionModel.date.desc(),
            TransactionModel.id.desc(),
        )
        .offset(offset)
        .limit(per_page)
    )

    transactions = list(db.scalars(statement).all())

    return transactions, total


def find_transaction_by_id(
    db: Session,
    transaction_id: int,
    user_id: Optional[int] = None,
) -> TransactionModel | None:
    statement = (
        select(TransactionModel)
        .options(selectinload(TransactionModel.category))
        .options(selectinload(TransactionModel.credit_card))
        .where(TransactionModel.id == transaction_id)
    )

    if user_id is not None:
        statement = statement.where(TransactionModel.user_id == user_id)

    return db.scalars(statement).first()


def find_transactions_by_group_id(
    db: Session,
    group_id: str,
    user_id: Optional[int] = None,
) -> list[TransactionModel]:
    statement = (
        select(TransactionModel)
        .options(selectinload(TransactionModel.category))
        .options(selectinload(TransactionModel.credit_card))
        .where(TransactionModel.installment_group_id == group_id)
        .order_by(TransactionModel.installment_number.asc(), TransactionModel.id.asc())
    )

    if user_id is not None:
        statement = statement.where(TransactionModel.user_id == user_id)

    return list(db.scalars(statement).all())


def create_transaction(
    db: Session,
    transaction: TransactionCreate,
    user_id: Optional[int] = None,
) -> TransactionModel:
    new_transaction = TransactionModel(
        description=transaction.description,
        amount=transaction.amount,
        type=transaction.type,
        payment_method=transaction.payment_method,
        spending_profile=transaction.spending_profile,
        due_date=transaction.due_date,
        payment_status=transaction.payment_status,
        installment_group_id=transaction.installment_group_id,
        installment_number=transaction.installment_number,
        installment_total=transaction.installment_total,
        category_id=transaction.category_id,
        credit_card_id=transaction.credit_card_id,
        date=transaction.date,
        user_id=user_id,
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    created_transaction = find_transaction_by_id(
        db=db,
        transaction_id=new_transaction.id,
    )

    if created_transaction is None:
        raise RuntimeError("Erro ao buscar transação criada")

    return created_transaction


def update_transaction(
    db: Session,
    transaction_id: int,
    transaction_data: TransactionUpdate,
    user_id: Optional[int] = None,
) -> TransactionModel | None:
    transaction = find_transaction_by_id(
        db=db,
        transaction_id=transaction_id,
        user_id=user_id,
    )

    if transaction is None:
        return None

    transaction.description = transaction_data.description
    transaction.amount = transaction_data.amount
    transaction.type = transaction_data.type
    transaction.payment_method = transaction_data.payment_method
    transaction.spending_profile = transaction_data.spending_profile
    transaction.due_date = transaction_data.due_date
    transaction.payment_status = transaction_data.payment_status
    transaction.installment_group_id = transaction_data.installment_group_id
    transaction.installment_number = transaction_data.installment_number
    transaction.installment_total = transaction_data.installment_total
    transaction.category_id = transaction_data.category_id
    transaction.credit_card_id = transaction_data.credit_card_id
    transaction.date = transaction_data.date

    db.commit()
    db.refresh(transaction)

    return find_transaction_by_id(
        db=db,
        transaction_id=transaction.id,
    )


def delete_transactions_by_group_id(
    db: Session,
    group_id: str,
    user_id: Optional[int] = None,
) -> int:
    transactions = find_transactions_by_group_id(
        db=db,
        group_id=group_id,
        user_id=user_id,
    )

    for transaction in transactions:
        db.delete(transaction)

    db.commit()
    return len(transactions)


def delete_transaction(
    db: Session,
    transaction_id: int,
    user_id: Optional[int] = None,
) -> TransactionModel | None:
    transaction = find_transaction_by_id(
        db=db,
        transaction_id=transaction_id,
        user_id=user_id,
    )

    if transaction is None:
        return None

    db.delete(transaction)
    db.commit()

    return transaction


def get_transactions_history(
    db: Session,
    start_date: dt.date,
    end_date: dt.date,
    group_by: Literal["day", "week", "month"] = "month",
    user_id: Optional[int] = None,
) -> list[dict]:
    statement = (
        select(TransactionModel)
        .where(TransactionModel.date >= start_date)
        .where(TransactionModel.date <= end_date)
        .order_by(TransactionModel.date.asc())
    )

    if user_id is not None:
        statement = statement.where(TransactionModel.user_id == user_id)

    transactions = list(db.scalars(statement).all())

    grouped: dict[str, dict[str, Decimal]] = defaultdict(
        lambda: {"income": Decimal("0.00"), "expense": Decimal("0.00")}
    )

    for transaction in transactions:
        if group_by == "day":
            period_key = transaction.date.strftime("%Y-%m-%d")
        elif group_by == "week":
            year, week, _ = transaction.date.isocalendar()
            period_key = f"{year}-W{week:02d}"
        else:
            period_key = transaction.date.strftime("%Y-%m")

        if transaction.type == "income":
            grouped[period_key]["income"] += transaction.amount
        else:
            grouped[period_key]["expense"] += transaction.amount

    result = []
    for period_key in sorted(grouped.keys()):
        data = grouped[period_key]
        result.append({
            "period": period_key,
            "income": data["income"],
            "expense": data["expense"],
            "balance": data["income"] - data["expense"],
        })

    return result