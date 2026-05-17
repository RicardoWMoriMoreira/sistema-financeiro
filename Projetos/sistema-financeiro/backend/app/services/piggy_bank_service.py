from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.repositories import piggy_bank_repository
from app.schemas.piggy_bank import (
    PiggyBankCreate,
    PiggyBankResponse,
    PiggyBankUpdate,
)


def _to_response(piggy_bank) -> PiggyBankResponse:
    target = Decimal(piggy_bank.target_amount)
    current = Decimal(piggy_bank.current_amount)
    progress = Decimal("0.00")

    if target > 0:
        progress = ((current / target) * Decimal("100")).quantize(Decimal("0.01"))

    remaining = max(target - current, Decimal("0.00")).quantize(Decimal("0.01"))

    return PiggyBankResponse(
        id=piggy_bank.id,
        name=piggy_bank.name,
        description=piggy_bank.description,
        target_amount=target,
        current_amount=current,
        progress_percentage=progress,
        remaining_amount=remaining,
        created_at=piggy_bank.created_at,
    )


def list_piggy_banks(
    db: Session,
    user_id: Optional[int] = None,
) -> list[PiggyBankResponse]:
    piggy_banks = piggy_bank_repository.list_piggy_banks(db=db, user_id=user_id)
    return [_to_response(item) for item in piggy_banks]


def create_piggy_bank(
    db: Session,
    payload: PiggyBankCreate,
    user_id: Optional[int] = None,
) -> PiggyBankResponse:
    piggy_bank = piggy_bank_repository.create_piggy_bank(db=db, payload=payload, user_id=user_id)
    return _to_response(piggy_bank)


def update_piggy_bank(
    db: Session,
    piggy_bank_id: int,
    payload: PiggyBankUpdate,
    user_id: Optional[int] = None,
) -> PiggyBankResponse | None:
    piggy_bank = piggy_bank_repository.update_piggy_bank(
        db=db,
        piggy_bank_id=piggy_bank_id,
        payload=payload,
        user_id=user_id,
    )
    if piggy_bank is None:
        return None
    return _to_response(piggy_bank)


def update_piggy_bank_balance(
    db: Session,
    piggy_bank_id: int,
    amount_delta: Decimal,
    user_id: Optional[int] = None,
) -> PiggyBankResponse | None:
    piggy_bank = piggy_bank_repository.update_piggy_bank_balance(
        db=db,
        piggy_bank_id=piggy_bank_id,
        amount_delta=amount_delta,
        user_id=user_id,
    )
    if piggy_bank is None:
        return None
    return _to_response(piggy_bank)


def delete_piggy_bank(
    db: Session,
    piggy_bank_id: int,
    user_id: Optional[int] = None,
) -> PiggyBankResponse | None:
    piggy_bank = piggy_bank_repository.delete_piggy_bank(
        db=db,
        piggy_bank_id=piggy_bank_id,
        user_id=user_id,
    )
    if piggy_bank is None:
        return None
    return _to_response(piggy_bank)
