from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.budget import BudgetModel
from app.schemas.budget import BudgetCreate, BudgetUpdate


def list_budgets(
    db: Session,
    month: Optional[str] = None,
    category_id: Optional[int] = None,
) -> list[BudgetModel]:
    statement = select(BudgetModel).options(selectinload(BudgetModel.category))

    if month is not None:
        statement = statement.where(BudgetModel.month == month)

    if category_id is not None:
        statement = statement.where(BudgetModel.category_id == category_id)

    statement = statement.order_by(
        BudgetModel.month.desc(),
        BudgetModel.id.desc(),
    )

    return list(db.scalars(statement).all())


def find_budget_by_id(
    db: Session,
    budget_id: int,
) -> BudgetModel | None:
    statement = (
        select(BudgetModel)
        .options(selectinload(BudgetModel.category))
        .where(BudgetModel.id == budget_id)
    )

    return db.scalars(statement).first()


def find_budget_by_category_and_month(
    db: Session,
    category_id: int,
    month: str,
) -> BudgetModel | None:
    statement = (
        select(BudgetModel)
        .options(selectinload(BudgetModel.category))
        .where(BudgetModel.category_id == category_id)
        .where(BudgetModel.month == month)
    )

    return db.scalars(statement).first()


def create_budget(
    db: Session,
    budget: BudgetCreate,
) -> BudgetModel:
    new_budget = BudgetModel(
        user_id=budget.user_id,
        category_id=budget.category_id,
        month=budget.month,
        amount_limit=budget.amount_limit,
    )

    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    created_budget = find_budget_by_id(
        db=db,
        budget_id=new_budget.id,
    )

    if created_budget is None:
        raise RuntimeError("Erro ao buscar orçamento criado")

    return created_budget


def update_budget(
    db: Session,
    budget_id: int,
    budget_data: BudgetUpdate,
) -> BudgetModel | None:
    budget = find_budget_by_id(
        db=db,
        budget_id=budget_id,
    )

    if budget is None:
        return None

    budget.category_id = budget_data.category_id
    budget.month = budget_data.month
    budget.amount_limit = budget_data.amount_limit

    db.commit()
    db.refresh(budget)

    return find_budget_by_id(
        db=db,
        budget_id=budget.id,
    )


def delete_budget(
    db: Session,
    budget_id: int,
) -> BudgetModel | None:
    budget = find_budget_by_id(
        db=db,
        budget_id=budget_id,
    )

    if budget is None:
        return None

    db.delete(budget)
    db.commit()

    return budget
