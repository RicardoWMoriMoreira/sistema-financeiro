from typing import Literal, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.goal import GoalModel
from app.schemas.goal import GoalCreate, GoalUpdate, GoalUpdateAmount


def list_goals(
    db: Session,
    status: Optional[Literal["active", "completed", "failed"]] = None,
    goal_type: Optional[Literal["saving", "spending"]] = None,
) -> list[GoalModel]:
    statement = select(GoalModel)

    if status is not None:
        statement = statement.where(GoalModel.status == status)

    if goal_type is not None:
        statement = statement.where(GoalModel.type == goal_type)

    statement = statement.order_by(
        GoalModel.deadline.asc(),
        GoalModel.id.desc(),
    )

    return list(db.scalars(statement).all())


def find_goal_by_id(
    db: Session,
    goal_id: int,
) -> GoalModel | None:
    statement = select(GoalModel).where(GoalModel.id == goal_id)

    return db.scalars(statement).first()


def create_goal(
    db: Session,
    goal: GoalCreate,
) -> GoalModel:
    new_goal = GoalModel(
        user_id=goal.user_id,
        name=goal.name,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        deadline=goal.deadline,
        type=goal.type,
        status="active",
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal


def update_goal(
    db: Session,
    goal_id: int,
    goal_data: GoalUpdate,
) -> GoalModel | None:
    goal = find_goal_by_id(
        db=db,
        goal_id=goal_id,
    )

    if goal is None:
        return None

    goal.name = goal_data.name
    goal.target_amount = goal_data.target_amount
    goal.current_amount = goal_data.current_amount
    goal.deadline = goal_data.deadline
    goal.type = goal_data.type
    goal.status = goal_data.status

    db.commit()
    db.refresh(goal)

    return goal


def update_goal_amount(
    db: Session,
    goal_id: int,
    amount_data: GoalUpdateAmount,
) -> GoalModel | None:
    goal = find_goal_by_id(
        db=db,
        goal_id=goal_id,
    )

    if goal is None:
        return None

    goal.current_amount = amount_data.current_amount

    if goal.current_amount >= goal.target_amount:
        goal.status = "completed"

    db.commit()
    db.refresh(goal)

    return goal


def delete_goal(
    db: Session,
    goal_id: int,
) -> GoalModel | None:
    goal = find_goal_by_id(
        db=db,
        goal_id=goal_id,
    )

    if goal is None:
        return None

    db.delete(goal)
    db.commit()

    return goal
