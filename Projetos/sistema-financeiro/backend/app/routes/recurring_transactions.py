import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.rate_limiter import limiter, RATE_LIMIT_READ, RATE_LIMIT_WRITE
from app.schemas.recurring_transaction import (
    ProcessRecurringResult,
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
    RecurringTransactionWithCategoryResponse,
)
from app.services.recurring_transaction_service import (
    create_recurring_transaction,
    delete_recurring_transaction,
    find_recurring_transaction_by_id,
    list_recurring_transactions,
    process_recurring_transactions,
    toggle_recurring_transaction,
    update_recurring_transaction,
)


router = APIRouter(
    prefix="/recurring-transactions",
    tags=["recurring-transactions"],
)


@router.get("/process", response_model=ProcessRecurringResult)
@limiter.limit(RATE_LIMIT_READ)
def process_recurring(
    request: Request,
    until_date: dt.date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return process_recurring_transactions(
        db=db,
        until_date=until_date,
    )


@router.get("", response_model=list[RecurringTransactionWithCategoryResponse])
@limiter.limit(RATE_LIMIT_READ)
def get_recurring_transactions(
    request: Request,
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_recurring_transactions(
        db=db,
        is_active=is_active,
    )


@router.get(
    "/{recurring_id}",
    response_model=RecurringTransactionWithCategoryResponse,
)
@limiter.limit(RATE_LIMIT_READ)
def get_recurring_transaction(
    request: Request,
    recurring_id: int,
    db: Session = Depends(get_db),
):
    recurring = find_recurring_transaction_by_id(
        db=db,
        recurring_id=recurring_id,
    )

    if recurring is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação recorrente não encontrada",
        )

    return recurring


@router.post(
    "",
    response_model=RecurringTransactionWithCategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit(RATE_LIMIT_WRITE)
def post_recurring_transaction(
    request: Request,
    recurring: RecurringTransactionCreate,
    db: Session = Depends(get_db),
):
    new_recurring = create_recurring_transaction(
        db=db,
        recurring=recurring,
    )

    if new_recurring is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Categoria não encontrada ou incompatível com o tipo da transação",
        )

    return new_recurring


@router.put(
    "/{recurring_id}",
    response_model=RecurringTransactionWithCategoryResponse,
)
@limiter.limit(RATE_LIMIT_WRITE)
def put_recurring_transaction(
    request: Request,
    recurring_id: int,
    recurring_data: RecurringTransactionUpdate,
    db: Session = Depends(get_db),
):
    try:
        recurring = update_recurring_transaction(
            db=db,
            recurring_id=recurring_id,
            recurring_data=recurring_data,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Categoria não encontrada ou incompatível com o tipo da transação",
        )

    if recurring is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação recorrente não encontrada",
        )

    return recurring


@router.patch(
    "/{recurring_id}/toggle",
    response_model=RecurringTransactionWithCategoryResponse,
)
@limiter.limit(RATE_LIMIT_WRITE)
def patch_toggle_recurring_transaction(
    request: Request,
    recurring_id: int,
    db: Session = Depends(get_db),
):
    recurring = toggle_recurring_transaction(
        db=db,
        recurring_id=recurring_id,
    )

    if recurring is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação recorrente não encontrada",
        )

    return recurring


@router.delete(
    "/{recurring_id}",
    response_model=RecurringTransactionWithCategoryResponse,
)
@limiter.limit(RATE_LIMIT_WRITE)
def remove_recurring_transaction(
    request: Request,
    recurring_id: int,
    db: Session = Depends(get_db),
):
    recurring = delete_recurring_transaction(
        db=db,
        recurring_id=recurring_id,
    )

    if recurring is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação recorrente não encontrada",
        )

    return recurring
