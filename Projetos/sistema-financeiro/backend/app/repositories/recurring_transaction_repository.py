import datetime as dt

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.recurring_transaction import RecurringTransactionModel
from app.schemas.recurring_transaction import (
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
)


def list_recurring_transactions(
    db: Session,
    is_active: Optional[bool] = None,
) -> list[RecurringTransactionModel]:
    statement = select(RecurringTransactionModel).options(
        selectinload(RecurringTransactionModel.category)
    )

    if is_active is not None:
        statement = statement.where(RecurringTransactionModel.is_active == is_active)

    statement = statement.order_by(
        RecurringTransactionModel.next_occurrence.asc(),
        RecurringTransactionModel.id.desc(),
    )

    return list(db.scalars(statement).all())


def find_recurring_transaction_by_id(
    db: Session,
    recurring_id: int,
) -> RecurringTransactionModel | None:
    statement = (
        select(RecurringTransactionModel)
        .options(selectinload(RecurringTransactionModel.category))
        .where(RecurringTransactionModel.id == recurring_id)
    )

    return db.scalars(statement).first()


def find_pending_recurring_transactions(
    db: Session,
    until_date: dt.date,
) -> list[RecurringTransactionModel]:
    statement = (
        select(RecurringTransactionModel)
        .options(selectinload(RecurringTransactionModel.category))
        .where(RecurringTransactionModel.is_active == True)
        .where(RecurringTransactionModel.next_occurrence <= until_date)
    )

    return list(db.scalars(statement).all())


def create_recurring_transaction(
    db: Session,
    recurring: RecurringTransactionCreate,
) -> RecurringTransactionModel:
    new_recurring = RecurringTransactionModel(
        description=recurring.description,
        amount=recurring.amount,
        type=recurring.type,
        category_id=recurring.category_id,
        frequency=recurring.frequency,
        start_date=recurring.start_date,
        end_date=recurring.end_date,
        next_occurrence=recurring.start_date,
        is_active=True,
        last_generated=None,
    )

    db.add(new_recurring)
    db.commit()
    db.refresh(new_recurring)

    created = find_recurring_transaction_by_id(
        db=db,
        recurring_id=new_recurring.id,
    )

    if created is None:
        raise RuntimeError("Erro ao buscar transação recorrente criada")

    return created


def update_recurring_transaction(
    db: Session,
    recurring_id: int,
    recurring_data: RecurringTransactionUpdate,
) -> RecurringTransactionModel | None:
    recurring = find_recurring_transaction_by_id(
        db=db,
        recurring_id=recurring_id,
    )

    if recurring is None:
        return None

    recurring.description = recurring_data.description
    recurring.amount = recurring_data.amount
    recurring.type = recurring_data.type
    recurring.category_id = recurring_data.category_id
    recurring.frequency = recurring_data.frequency
    recurring.start_date = recurring_data.start_date
    recurring.end_date = recurring_data.end_date
    recurring.is_active = recurring_data.is_active

    db.commit()
    db.refresh(recurring)

    return find_recurring_transaction_by_id(
        db=db,
        recurring_id=recurring.id,
    )


def delete_recurring_transaction(
    db: Session,
    recurring_id: int,
) -> RecurringTransactionModel | None:
    recurring = find_recurring_transaction_by_id(
        db=db,
        recurring_id=recurring_id,
    )

    if recurring is None:
        return None

    db.delete(recurring)
    db.commit()

    return recurring


def update_next_occurrence(
    db: Session,
    recurring: RecurringTransactionModel,
    next_date: dt.date,
    last_generated: dt.date,
) -> None:
    recurring.next_occurrence = next_date
    recurring.last_generated = last_generated
    db.commit()


def deactivate_recurring_transaction(
    db: Session,
    recurring: RecurringTransactionModel,
) -> None:
    recurring.is_active = False
    db.commit()
