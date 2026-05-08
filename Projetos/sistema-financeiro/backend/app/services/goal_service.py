import datetime as dt

from decimal import Decimal
from typing import Literal, Optional

from sqlalchemy.orm import Session

from app.models.goal import GoalModel
from app.repositories import goal_repository
from app.schemas.goal import (
    GoalCreate,
    GoalProgressResponse,
    GoalResponse,
    GoalsSummary,
    GoalUpdate,
    GoalUpdateAmount,
)


def to_goal_response(
    goal: GoalModel,
) -> GoalResponse:
    return GoalResponse.model_validate(goal)


def calculate_progress(goal: GoalModel) -> GoalProgressResponse:
    if goal.target_amount > 0:
        progress_percentage = (goal.current_amount / goal.target_amount) * 100
    else:
        progress_percentage = Decimal("0.00")

    remaining_amount = goal.target_amount - goal.current_amount

    if remaining_amount < 0:
        remaining_amount = Decimal("0.00")

    today = dt.date.today()
    days_remaining = (goal.deadline - today).days

    if days_remaining < 0:
        days_remaining = 0

    if goal.status == "completed":
        is_on_track = True
    elif goal.status == "failed":
        is_on_track = False
    elif days_remaining <= 0:
        is_on_track = goal.current_amount >= goal.target_amount
    else:
        total_days = (goal.deadline - goal.created_at).days
        if total_days > 0:
            days_passed = total_days - days_remaining
            expected_progress = (days_passed / total_days) * 100
            is_on_track = float(progress_percentage) >= expected_progress * 0.8
        else:
            is_on_track = goal.current_amount >= goal.target_amount

    return GoalProgressResponse(
        id=goal.id,
        name=goal.name,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        deadline=goal.deadline,
        type=goal.type,
        status=goal.status,
        progress_percentage=round(progress_percentage, 2),
        remaining_amount=remaining_amount,
        days_remaining=days_remaining,
        is_on_track=is_on_track,
    )


def list_goals(
    db: Session,
    status: Optional[Literal["active", "completed", "failed"]] = None,
    goal_type: Optional[Literal["saving", "spending"]] = None,
) -> list[GoalResponse]:
    goals = goal_repository.list_goals(
        db=db,
        status=status,
        goal_type=goal_type,
    )

    return [to_goal_response(goal) for goal in goals]


def list_goals_with_progress(
    db: Session,
    status: Optional[Literal["active", "completed", "failed"]] = None,
    goal_type: Optional[Literal["saving", "spending"]] = None,
) -> list[GoalProgressResponse]:
    goals = goal_repository.list_goals(
        db=db,
        status=status,
        goal_type=goal_type,
    )

    return [calculate_progress(goal) for goal in goals]


def find_goal_by_id(
    db: Session,
    goal_id: int,
) -> Optional[GoalResponse]:
    goal = goal_repository.find_goal_by_id(
        db=db,
        goal_id=goal_id,
    )

    if goal is None:
        return None

    return to_goal_response(goal)


def get_goal_progress(
    db: Session,
    goal_id: int,
) -> Optional[GoalProgressResponse]:
    goal = goal_repository.find_goal_by_id(
        db=db,
        goal_id=goal_id,
    )

    if goal is None:
        return None

    return calculate_progress(goal)


def create_goal(
    db: Session,
    goal: GoalCreate,
) -> GoalResponse:
    new_goal = goal_repository.create_goal(
        db=db,
        goal=goal,
    )

    return to_goal_response(new_goal)


def update_goal(
    db: Session,
    goal_id: int,
    goal_data: GoalUpdate,
) -> Optional[GoalResponse]:
    goal = goal_repository.update_goal(
        db=db,
        goal_id=goal_id,
        goal_data=goal_data,
    )

    if goal is None:
        return None

    return to_goal_response(goal)


def update_goal_amount(
    db: Session,
    goal_id: int,
    amount_data: GoalUpdateAmount,
) -> Optional[GoalResponse]:
    goal = goal_repository.update_goal_amount(
        db=db,
        goal_id=goal_id,
        amount_data=amount_data,
    )

    if goal is None:
        return None

    return to_goal_response(goal)


def delete_goal(
    db: Session,
    goal_id: int,
) -> Optional[GoalResponse]:
    goal = goal_repository.delete_goal(
        db=db,
        goal_id=goal_id,
    )

    if goal is None:
        return None

    return to_goal_response(goal)


def get_goals_summary(
    db: Session,
) -> GoalsSummary:
    goals = goal_repository.list_goals(db=db)

    total_goals = len(goals)
    active_goals = sum(1 for g in goals if g.status == "active")
    completed_goals = sum(1 for g in goals if g.status == "completed")
    failed_goals = sum(1 for g in goals if g.status == "failed")

    total_target = sum(
        (g.target_amount for g in goals),
        Decimal("0.00"),
    )

    total_current = sum(
        (g.current_amount for g in goals),
        Decimal("0.00"),
    )

    if total_target > 0:
        overall_progress = (total_current / total_target) * 100
    else:
        overall_progress = Decimal("0.00")

    return GoalsSummary(
        total_goals=total_goals,
        active_goals=active_goals,
        completed_goals=completed_goals,
        failed_goals=failed_goals,
        total_target=total_target,
        total_current=total_current,
        overall_progress=round(overall_progress, 2),
    )
