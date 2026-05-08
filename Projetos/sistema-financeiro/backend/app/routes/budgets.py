from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.budget import (
    BudgetCreate,
    BudgetStatusResponse,
    BudgetUpdate,
    BudgetWithCategoryResponse,
)
from app.services.budget_service import (
    create_budget,
    delete_budget,
    find_budget_by_id,
    get_budget_status,
    get_exceeded_budgets,
    list_budgets,
    update_budget,
)


router = APIRouter(
    prefix="/budgets",
    tags=["budgets"],
)


@router.get("", response_model=list[BudgetWithCategoryResponse])
def get_budgets(
    month: Optional[str] = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    return list_budgets(
        db=db,
        month=month,
        category_id=category_id,
    )


@router.get("/status", response_model=list[BudgetStatusResponse])
def get_budgets_status(
    month: Optional[str] = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    db: Session = Depends(get_db),
):
    return get_budget_status(
        db=db,
        month=month,
    )


@router.get("/exceeded", response_model=list[BudgetStatusResponse])
def get_budgets_exceeded(
    month: Optional[str] = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    db: Session = Depends(get_db),
):
    return get_exceeded_budgets(
        db=db,
        month=month,
    )


@router.get("/{budget_id}", response_model=BudgetWithCategoryResponse)
def get_budget(
    budget_id: int,
    db: Session = Depends(get_db),
):
    budget = find_budget_by_id(
        db=db,
        budget_id=budget_id,
    )

    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado",
        )

    return budget


@router.post(
    "",
    response_model=BudgetWithCategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def post_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
):
    try:
        new_budget = create_budget(
            db=db,
            budget=budget,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    if new_budget is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Categoria não encontrada ou não é do tipo despesa",
        )

    return new_budget


@router.put("/{budget_id}", response_model=BudgetWithCategoryResponse)
def put_budget(
    budget_id: int,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db),
):
    try:
        budget = update_budget(
            db=db,
            budget_id=budget_id,
            budget_data=budget_data,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado",
        )

    return budget


@router.delete("/{budget_id}", response_model=BudgetWithCategoryResponse)
def remove_budget(
    budget_id: int,
    db: Session = Depends(get_db),
):
    budget = delete_budget(
        db=db,
        budget_id=budget_id,
    )

    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado",
        )

    return budget
