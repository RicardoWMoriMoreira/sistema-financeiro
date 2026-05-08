from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user_id, get_db
from app.rate_limiter import limiter, RATE_LIMIT_READ, RATE_LIMIT_WRITE
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)
from app.services.category_service import (
    create_category,
    delete_category,
    find_category_by_id,
    list_categories,
    update_category,
)


router = APIRouter(
    prefix="/categories",
    tags=["categories"],
)


@router.get("", response_model=list[CategoryResponse])
@limiter.limit(RATE_LIMIT_READ)
def get_categories(
    request: Request,
    category_type: Literal["income", "expense"] | None = Query(
        default=None,
        alias="type",
    ),
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    return list_categories(
        db=db,
        user_id=user_id,
        category_type=category_type,
    )


@router.get("/{category_id}", response_model=CategoryResponse)
@limiter.limit(RATE_LIMIT_READ)
def get_category(
    request: Request,
    category_id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    category = find_category_by_id(
        db=db,
        category_id=category_id,
        user_id=user_id,
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada",
        )

    return category


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(RATE_LIMIT_WRITE)
def post_category(
    request: Request,
    category: CategoryCreate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    new_category = create_category(
        db=db,
        category=category,
        user_id=user_id,
    )

    if new_category is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Categoria já existe",
        )

    return new_category


@router.put("/{category_id}", response_model=CategoryResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def put_category(
    request: Request,
    category_id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    try:
        category = update_category(
            db=db,
            category_id=category_id,
            category_data=category_data,
            user_id=user_id,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Categoria já existe",
        )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada",
        )

    return category


@router.delete("/{category_id}", response_model=CategoryResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def remove_category(
    request: Request,
    category_id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    try:
        category = delete_category(
            db=db,
            category_id=category_id,
            user_id=user_id,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Categoria possui transações vinculadas",
        )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada",
        )

    return category