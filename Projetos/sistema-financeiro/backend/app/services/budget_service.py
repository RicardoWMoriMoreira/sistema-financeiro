import datetime as dt

from decimal import Decimal
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.budget import BudgetModel
from app.models.transaction import TransactionModel
from app.repositories import budget_repository, category_repository
from app.schemas.budget import (
    BudgetCreate,
    BudgetStatusResponse,
    BudgetUpdate,
    BudgetWithCategoryResponse,
)
from app.schemas.category import CategoryResponse
from app.utils.datetime import get_brazil_today


def to_budget_response(
    budget: BudgetModel,
) -> BudgetWithCategoryResponse:
    return BudgetWithCategoryResponse.model_validate(budget)


def list_budgets(
    db: Session,
    month: Optional[str] = None,
    category_id: Optional[int] = None,
) -> list[BudgetWithCategoryResponse]:
    budgets = budget_repository.list_budgets(
        db=db,
        month=month,
        category_id=category_id,
    )

    return [to_budget_response(budget) for budget in budgets]


def find_budget_by_id(
    db: Session,
    budget_id: int,
) -> Optional[BudgetWithCategoryResponse]:
    budget = budget_repository.find_budget_by_id(
        db=db,
        budget_id=budget_id,
    )

    if budget is None:
        return None

    return to_budget_response(budget)


def create_budget(
    db: Session,
    budget: BudgetCreate,
) -> BudgetWithCategoryResponse | None:
    category = category_repository.find_category_by_id(
        db=db,
        category_id=budget.category_id,
    )

    if category is None:
        return None

    if category.type != "expense":
        return None

    existing = budget_repository.find_budget_by_category_and_month(
        db=db,
        category_id=budget.category_id,
        month=budget.month,
    )

    if existing is not None:
        raise ValueError("Já existe um orçamento para esta categoria neste mês")

    new_budget = budget_repository.create_budget(
        db=db,
        budget=budget,
    )

    return to_budget_response(new_budget)


def update_budget(
    db: Session,
    budget_id: int,
    budget_data: BudgetUpdate,
) -> Optional[BudgetWithCategoryResponse]:
    category = category_repository.find_category_by_id(
        db=db,
        category_id=budget_data.category_id,
    )

    if category is None or category.type != "expense":
        raise ValueError("Categoria inválida para orçamento")

    budget = budget_repository.update_budget(
        db=db,
        budget_id=budget_id,
        budget_data=budget_data,
    )

    if budget is None:
        return None

    return to_budget_response(budget)


def delete_budget(
    db: Session,
    budget_id: int,
) -> Optional[BudgetWithCategoryResponse]:
    budget = budget_repository.delete_budget(
        db=db,
        budget_id=budget_id,
    )

    if budget is None:
        return None

    return to_budget_response(budget)


def get_budget_status(
    db: Session,
    month: Optional[str] = None,
) -> list[BudgetStatusResponse]:
    if month is None:
        month = get_brazil_today().strftime("%Y-%m")

    budgets = budget_repository.list_budgets(
        db=db,
        month=month,
    )

    result = []

    for budget in budgets:
        year, month_num = map(int, budget.month.split("-"))
        start_date = dt.date(year, month_num, 1)

        if month_num == 12:
            end_date = dt.date(year + 1, 1, 1) - dt.timedelta(days=1)
        else:
            end_date = dt.date(year, month_num + 1, 1) - dt.timedelta(days=1)

        statement = (
            select(TransactionModel)
            .where(TransactionModel.category_id == budget.category_id)
            .where(TransactionModel.type == "expense")
            .where(TransactionModel.date >= start_date)
            .where(TransactionModel.date <= end_date)
        )

        transactions = list(db.scalars(statement).all())

        amount_spent = sum(
            (t.amount for t in transactions),
            Decimal("0.00"),
        )

        remaining = budget.amount_limit - amount_spent

        if budget.amount_limit > 0:
            percentage_used = (amount_spent / budget.amount_limit) * 100
        else:
            percentage_used = Decimal("0.00")

        is_exceeded = amount_spent > budget.amount_limit

        result.append(
            BudgetStatusResponse(
                id=budget.id,
                category_id=budget.category_id,
                category=CategoryResponse.model_validate(budget.category),
                month=budget.month,
                amount_limit=budget.amount_limit,
                amount_spent=amount_spent,
                remaining=remaining,
                percentage_used=round(percentage_used, 2),
                is_exceeded=is_exceeded,
            )
        )

    return result


def get_exceeded_budgets(
    db: Session,
    month: Optional[str] = None,
) -> list[BudgetStatusResponse]:
    statuses = get_budget_status(db=db, month=month)

    return [s for s in statuses if s.is_exceeded]
