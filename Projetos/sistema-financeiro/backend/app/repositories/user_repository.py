from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import UserModel
from app.schemas.user import UserCreate


def find_user_by_email(
    db: Session,
    email: str,
) -> UserModel | None:
    statement = select(UserModel).where(UserModel.email == email)
    return db.scalars(statement).first()


def find_user_by_id(
    db: Session,
    user_id: int,
) -> UserModel | None:
    statement = select(UserModel).where(UserModel.id == user_id)
    return db.scalars(statement).first()


def create_user(
    db: Session,
    user: UserCreate,
    password_hash: str,
) -> UserModel:
    new_user = UserModel(
        name=user.name,
        email=user.email,
        password_hash=password_hash,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
