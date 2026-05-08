from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.goal import (
    GoalCreate,
    GoalProgressResponse,
    GoalResponse,
    GoalsSummary,
    GoalUpdate,
    GoalUpdateAmount,
)
from app.services.goal_service import (
    create_goal,
    delete_goal,
    find_goal_by_id,
    get_goal_progress,
    get_goals_summary,
    list_goals,
    list_goals_with_progress,
    update_goal,
    update_goal_amount,
)


router = APIRouter(
    prefix="/goals",
    tags=["goals"],
)


@router.get("", response_model=list[GoalResponse])
def get_goals(
    status_filter: Optional[Literal["active", "completed", "failed"]] = Query(
        default=None,
        alias="status",
    ),
    goal_type: Optional[Literal["saving", "spending"]] = Query(
        default=None,
        alias="type",
    ),
    db: Session = Depends(get_db),
):
    return list_goals(
        db=db,
        status=status_filter,
        goal_type=goal_type,
    )


@router.get("/progress", response_model=list[GoalProgressResponse])
def get_goals_progress(
    status_filter: Optional[Literal["active", "completed", "failed"]] = Query(
        default=None,
        alias="status",
    ),
    goal_type: Optional[Literal["saving", "spending"]] = Query(
        default=None,
        alias="type",
    ),
    db: Session = Depends(get_db),
):
    return list_goals_with_progress(
        db=db,
        status=status_filter,
        goal_type=goal_type,
    )


@router.get("/summary", response_model=GoalsSummary)
def get_summary(
    db: Session = Depends(get_db),
):
    return get_goals_summary(db=db)


@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
):
    goal = find_goal_by_id(
        db=db,
        goal_id=goal_id,
    )

    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada",
        )

    return goal


@router.get("/{goal_id}/progress", response_model=GoalProgressResponse)
def get_single_goal_progress(
    goal_id: int,
    db: Session = Depends(get_db),
):
    progress = get_goal_progress(
        db=db,
        goal_id=goal_id,
    )

    if progress is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada",
        )

    return progress


@router.post(
    "",
    response_model=GoalResponse,
    status_code=status.HTTP_201_CREATED,
)
def post_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
):
    return create_goal(
        db=db,
        goal=goal,
    )


@router.put("/{goal_id}", response_model=GoalResponse)
def put_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    db: Session = Depends(get_db),
):
    goal = update_goal(
        db=db,
        goal_id=goal_id,
        goal_data=goal_data,
    )

    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada",
        )

    return goal


@router.patch("/{goal_id}/amount", response_model=GoalResponse)
def patch_goal_amount(
    goal_id: int,
    amount_data: GoalUpdateAmount,
    db: Session = Depends(get_db),
):
    goal = update_goal_amount(
        db=db,
        goal_id=goal_id,
        amount_data=amount_data,
    )

    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada",
        )

    return goal


@router.delete("/{goal_id}", response_model=GoalResponse)
def remove_goal(
    goal_id: int,
    db: Session = Depends(get_db),
):
    goal = delete_goal(
        db=db,
        goal_id=goal_id,
    )

    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meta não encontrada",
        )

    return goal
