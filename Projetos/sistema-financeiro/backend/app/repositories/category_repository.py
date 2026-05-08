from typing import Literal, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import CategoryModel
from app.models.transaction import TransactionModel
from app.schemas.category import CategoryCreate, CategoryUpdate


def list_categories(
    db: Session,
    user_id: Optional[int] = None,
    category_type: Optional[Literal["income", "expense"]] = None,
) -> list[CategoryModel]:
    statement = select(CategoryModel)

    if user_id is not None:
        statement = statement.where(CategoryModel.user_id == user_id)

    if category_type is not None:
        statement = statement.where(CategoryModel.type == category_type)

    statement = statement.order_by(
        CategoryModel.type.asc(),
        CategoryModel.name.asc(),
    )

    return list(db.scalars(statement).all())


def find_category_by_id(
    db: Session,
    category_id: int,
    user_id: Optional[int] = None,
) -> CategoryModel | None:
    if user_id is None:
        return db.get(CategoryModel, category_id)

    statement = select(CategoryModel).where(
        CategoryModel.id == category_id,
        CategoryModel.user_id == user_id,
    )

    return db.scalars(statement).first()


def find_category_by_name_and_type(
    db: Session,
    name: str,
    category_type: Literal["income", "expense"],
    user_id: Optional[int] = None,
) -> CategoryModel | None:
    statement = select(CategoryModel).where(
        CategoryModel.name == name,
        CategoryModel.type == category_type,
    )

    if user_id is not None:
        statement = statement.where(CategoryModel.user_id == user_id)

    return db.scalars(statement).first()


def category_has_transactions(
    db: Session,
    category_id: int,
    user_id: Optional[int] = None,
) -> bool:
    statement = (
        select(TransactionModel.id)
        .where(TransactionModel.category_id == category_id)
    )

    if user_id is not None:
        statement = statement.where(TransactionModel.user_id == user_id)

    statement = statement.limit(1)

    transaction_id = db.scalars(statement).first()

    return transaction_id is not None


def create_category(
    db: Session,
    category: CategoryCreate,
    user_id: Optional[int] = None,
) -> CategoryModel:
    new_category = CategoryModel(
        name=category.name,
        type=category.type,
        user_id=user_id,
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


def update_category(
    db: Session,
    category_id: int,
    category_data: CategoryUpdate,
    user_id: Optional[int] = None,
) -> CategoryModel | None:
    category = find_category_by_id(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    if category is None:
        return None

    category.name = category_data.name
    category.type = category_data.type

    db.commit()
    db.refresh(category)

    return category


def delete_category(
    db: Session,
    category_id: int,
    user_id: Optional[int] = None,
) -> CategoryModel | None:
    category = find_category_by_id(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    if category is None:
        return None

    db.delete(category)
    db.commit()

    return category