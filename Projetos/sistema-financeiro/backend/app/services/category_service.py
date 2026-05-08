from typing import Literal, Optional

from sqlalchemy.orm import Session

from app.models.category import CategoryModel
from app.repositories import category_repository
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)


def to_category_response(category: CategoryModel) -> CategoryResponse:
    return CategoryResponse.model_validate(category)


def list_categories(
    db: Session,
    user_id: Optional[int] = None,
    category_type: Optional[Literal["income", "expense"]] = None,
) -> list[CategoryResponse]:
    categories = category_repository.list_categories(
        db=db,
        user_id=user_id,
        category_type=category_type,
    )

    return [
        to_category_response(category)
        for category in categories
    ]


def find_category_by_id(
    db: Session,
    category_id: int,
    user_id: Optional[int] = None,
) -> Optional[CategoryResponse]:
    category = category_repository.find_category_by_id(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    if category is None:
        return None

    return to_category_response(category)


def category_exists(
    db: Session,
    name: str,
    category_type: Literal["income", "expense"],
    user_id: Optional[int] = None,
) -> bool:
    category = category_repository.find_category_by_name_and_type(
        db=db,
        name=name,
        category_type=category_type,
        user_id=user_id,
    )

    return category is not None


def create_category(
    db: Session,
    category: CategoryCreate,
    user_id: Optional[int] = None,
) -> CategoryResponse | None:
    if category_exists(
        db=db,
        name=category.name,
        category_type=category.type,
        user_id=user_id,
    ):
        return None

    new_category = category_repository.create_category(
        db=db,
        category=category,
        user_id=user_id,
    )

    return to_category_response(new_category)


def update_category(
    db: Session,
    category_id: int,
    category_data: CategoryUpdate,
    user_id: Optional[int] = None,
) -> CategoryResponse | None:
    current_category = category_repository.find_category_by_id(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    if current_category is None:
        return None

    duplicated_category = category_repository.find_category_by_name_and_type(
        db=db,
        name=category_data.name,
        category_type=category_data.type,
        user_id=user_id,
    )

    if duplicated_category is not None and duplicated_category.id != category_id:
        raise ValueError("Categoria já existe")

    updated_category = category_repository.update_category(
        db=db,
        category_id=category_id,
        category_data=category_data,
        user_id=user_id,
    )

    if updated_category is None:
        return None

    return to_category_response(updated_category)


def delete_category(
    db: Session,
    category_id: int,
    user_id: Optional[int] = None,
) -> Optional[CategoryResponse]:
    category = category_repository.find_category_by_id(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    if category is None:
        return None

    has_transactions = category_repository.category_has_transactions(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    if has_transactions:
        raise ValueError("Categoria possui transações vinculadas")

    deleted_category = category_repository.delete_category(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    if deleted_category is None:
        return None

    return to_category_response(deleted_category)