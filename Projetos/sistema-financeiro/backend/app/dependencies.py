from collections.abc import Generator
from typing import Optional

from fastapi import Header
from sqlalchemy.orm import Session

from app.database import SessionLocal


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_current_user_id(
    x_user_id: Optional[int] = Header(default=None, alias="X-User-Id"),
) -> Optional[int]:
    return x_user_id