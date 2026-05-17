from decimal import Decimal
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.piggy_bank import PiggyBankModel
from app.schemas.piggy_bank import PiggyBankCreate, PiggyBankUpdate


def list_piggy_banks(
    db: Session,
    user_id: Optional[int] = None,
) -> list[PiggyBankModel]:
    statement = select(PiggyBankModel)
    if user_id is not None:
        statement = statement.where(PiggyBankModel.user_id == user_id)
    statement = statement.order_by(PiggyBankModel.created_at.desc(), PiggyBankModel.id.desc())
    return list(db.scalars(statement).all())


def find_piggy_bank_by_id(
    db: Session,
    piggy_bank_id: int,
    user_id: Optional[int] = None,
) -> PiggyBankModel | None:
    statement = select(PiggyBankModel).where(PiggyBankModel.id == piggy_bank_id)
    if user_id is not None:
        statement = statement.where(PiggyBankModel.user_id == user_id)
    return db.scalars(statement).first()


def create_piggy_bank(
    db: Session,
    payload: PiggyBankCreate,
    user_id: Optional[int] = None,
) -> PiggyBankModel:
    piggy_bank = PiggyBankModel(
        name=payload.name,
        description=payload.description,
        target_amount=payload.target_amount,
        current_amount=payload.current_amount,
        user_id=user_id,
    )
    db.add(piggy_bank)
    db.commit()
    db.refresh(piggy_bank)
    return piggy_bank


def update_piggy_bank(
    db: Session,
    piggy_bank_id: int,
    payload: PiggyBankUpdate,
    user_id: Optional[int] = None,
) -> PiggyBankModel | None:
    piggy_bank = find_piggy_bank_by_id(db=db, piggy_bank_id=piggy_bank_id, user_id=user_id)
    if piggy_bank is None:
        return None

    piggy_bank.name = payload.name
    piggy_bank.description = payload.description
    piggy_bank.target_amount = payload.target_amount
    piggy_bank.current_amount = payload.current_amount
    db.commit()
    db.refresh(piggy_bank)
    return piggy_bank


def update_piggy_bank_balance(
    db: Session,
    piggy_bank_id: int,
    amount_delta: Decimal,
    user_id: Optional[int] = None,
) -> PiggyBankModel | None:
    piggy_bank = find_piggy_bank_by_id(db=db, piggy_bank_id=piggy_bank_id, user_id=user_id)
    if piggy_bank is None:
        return None

    new_amount = piggy_bank.current_amount + amount_delta
    if new_amount < 0:
        raise ValueError("O saldo do cofrinho não pode ficar negativo.")

    piggy_bank.current_amount = new_amount
    db.commit()
    db.refresh(piggy_bank)
    return piggy_bank


def delete_piggy_bank(
    db: Session,
    piggy_bank_id: int,
    user_id: Optional[int] = None,
) -> PiggyBankModel | None:
    piggy_bank = find_piggy_bank_by_id(db=db, piggy_bank_id=piggy_bank_id, user_id=user_id)
    if piggy_bank is None:
        return None
    db.delete(piggy_bank)
    db.commit()
    return piggy_bank
