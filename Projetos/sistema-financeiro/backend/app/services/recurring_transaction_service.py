import datetime as dt

from dateutil.relativedelta import relativedelta
from typing import Literal, Optional

from sqlalchemy.orm import Session

from app.models.recurring_transaction import RecurringTransactionModel
from app.repositories import category_repository, recurring_transaction_repository
from app.repositories import transaction_repository
from app.schemas.recurring_transaction import (
    ProcessRecurringResult,
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
    RecurringTransactionWithCategoryResponse,
)
from app.schemas.transaction import TransactionCreate
from app.utils.datetime import get_brazil_today


def to_recurring_response(
    recurring: RecurringTransactionModel,
) -> RecurringTransactionWithCategoryResponse:
    return RecurringTransactionWithCategoryResponse.model_validate(recurring)


def validate_category_for_transaction(
    db: Session,
    transaction_type: Literal["income", "expense"],
    category_id: int,
) -> bool:
    category = category_repository.find_category_by_id(
        db=db,
        category_id=category_id,
    )

    if category is None:
        return False

    return category.type == transaction_type


def calculate_next_occurrence(
    current_date: dt.date,
    frequency: str,
) -> dt.date:
    if frequency == "daily":
        return current_date + dt.timedelta(days=1)
    elif frequency == "weekly":
        return current_date + dt.timedelta(weeks=1)
    elif frequency == "monthly":
        return current_date + relativedelta(months=1)
    elif frequency == "yearly":
        return current_date + relativedelta(years=1)
    else:
        return current_date + relativedelta(months=1)


def list_recurring_transactions(
    db: Session,
    is_active: Optional[bool] = None,
) -> list[RecurringTransactionWithCategoryResponse]:
    recurring_list = recurring_transaction_repository.list_recurring_transactions(
        db=db,
        is_active=is_active,
    )

    return [to_recurring_response(r) for r in recurring_list]


def find_recurring_transaction_by_id(
    db: Session,
    recurring_id: int,
) -> Optional[RecurringTransactionWithCategoryResponse]:
    recurring = recurring_transaction_repository.find_recurring_transaction_by_id(
        db=db,
        recurring_id=recurring_id,
    )

    if recurring is None:
        return None

    return to_recurring_response(recurring)


def create_recurring_transaction(
    db: Session,
    recurring: RecurringTransactionCreate,
) -> RecurringTransactionWithCategoryResponse | None:
    is_valid_category = validate_category_for_transaction(
        db=db,
        transaction_type=recurring.type,
        category_id=recurring.category_id,
    )

    if not is_valid_category:
        return None

    new_recurring = recurring_transaction_repository.create_recurring_transaction(
        db=db,
        recurring=recurring,
    )

    return to_recurring_response(new_recurring)


def update_recurring_transaction(
    db: Session,
    recurring_id: int,
    recurring_data: RecurringTransactionUpdate,
) -> Optional[RecurringTransactionWithCategoryResponse]:
    is_valid_category = validate_category_for_transaction(
        db=db,
        transaction_type=recurring_data.type,
        category_id=recurring_data.category_id,
    )

    if not is_valid_category:
        raise ValueError("Categoria inválida para esta transação recorrente")

    recurring = recurring_transaction_repository.update_recurring_transaction(
        db=db,
        recurring_id=recurring_id,
        recurring_data=recurring_data,
    )

    if recurring is None:
        return None

    return to_recurring_response(recurring)


def delete_recurring_transaction(
    db: Session,
    recurring_id: int,
) -> Optional[RecurringTransactionWithCategoryResponse]:
    recurring = recurring_transaction_repository.delete_recurring_transaction(
        db=db,
        recurring_id=recurring_id,
    )

    if recurring is None:
        return None

    return to_recurring_response(recurring)


def toggle_recurring_transaction(
    db: Session,
    recurring_id: int,
) -> Optional[RecurringTransactionWithCategoryResponse]:
    recurring = recurring_transaction_repository.find_recurring_transaction_by_id(
        db=db,
        recurring_id=recurring_id,
    )

    if recurring is None:
        return None

    recurring.is_active = not recurring.is_active
    db.commit()
    db.refresh(recurring)

    return to_recurring_response(recurring)


def process_recurring_transactions(
    db: Session,
    until_date: Optional[dt.date] = None,
) -> ProcessRecurringResult:
    if until_date is None:
        until_date = get_brazil_today()

    pending = recurring_transaction_repository.find_pending_recurring_transactions(
        db=db,
        until_date=until_date,
    )

    processed_count = 0
    transactions_created = 0

    for recurring in pending:
        current_occurrence = recurring.next_occurrence

        while current_occurrence <= until_date:
            if recurring.end_date and current_occurrence > recurring.end_date:
                recurring_transaction_repository.deactivate_recurring_transaction(
                    db=db,
                    recurring=recurring,
                )
                break

            transaction_data = TransactionCreate(
                description=recurring.description,
                amount=recurring.amount,
                type=recurring.type,
                category_id=recurring.category_id,
                date=current_occurrence,
            )

            transaction_repository.create_transaction(
                db=db,
                transaction=transaction_data,
            )

            transactions_created += 1

            next_date = calculate_next_occurrence(
                current_date=current_occurrence,
                frequency=recurring.frequency,
            )

            if recurring.end_date and next_date > recurring.end_date:
                recurring_transaction_repository.deactivate_recurring_transaction(
                    db=db,
                    recurring=recurring,
                )
                recurring_transaction_repository.update_next_occurrence(
                    db=db,
                    recurring=recurring,
                    next_date=next_date,
                    last_generated=current_occurrence,
                )
                break

            recurring_transaction_repository.update_next_occurrence(
                db=db,
                recurring=recurring,
                next_date=next_date,
                last_generated=current_occurrence,
            )

            current_occurrence = next_date

        processed_count += 1

    return ProcessRecurringResult(
        processed_count=processed_count,
        transactions_created=transactions_created,
    )
