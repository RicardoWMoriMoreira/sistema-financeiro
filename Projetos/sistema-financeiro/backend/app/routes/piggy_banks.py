from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user_id, get_db
from app.rate_limiter import limiter, RATE_LIMIT_READ, RATE_LIMIT_WRITE
from app.schemas.piggy_bank import (
    PiggyBankBalanceUpdate,
    PiggyBankCreate,
    PiggyBankResponse,
    PiggyBankUpdate,
)
from app.services.piggy_bank_service import (
    create_piggy_bank,
    delete_piggy_bank,
    list_piggy_banks,
    update_piggy_bank,
    update_piggy_bank_balance,
)

router = APIRouter(
    prefix="/piggy-banks",
    tags=["piggy-banks"],
)


@router.get("", response_model=list[PiggyBankResponse])
@limiter.limit(RATE_LIMIT_READ)
def get_piggy_banks(
    request: Request,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    return list_piggy_banks(db=db, user_id=user_id)


@router.post("", response_model=PiggyBankResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(RATE_LIMIT_WRITE)
def post_piggy_bank(
    request: Request,
    payload: PiggyBankCreate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    return create_piggy_bank(db=db, payload=payload, user_id=user_id)


@router.put("/{piggy_bank_id}", response_model=PiggyBankResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def put_piggy_bank(
    request: Request,
    piggy_bank_id: int,
    payload: PiggyBankUpdate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    piggy_bank = update_piggy_bank(
        db=db,
        piggy_bank_id=piggy_bank_id,
        payload=payload,
        user_id=user_id,
    )
    if piggy_bank is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cofrinho não encontrado")
    return piggy_bank


@router.patch("/{piggy_bank_id}/balance", response_model=PiggyBankResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def patch_piggy_bank_balance(
    request: Request,
    piggy_bank_id: int,
    payload: PiggyBankBalanceUpdate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    try:
        piggy_bank = update_piggy_bank_balance(
            db=db,
            piggy_bank_id=piggy_bank_id,
            amount_delta=payload.amount_delta,
            user_id=user_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    if piggy_bank is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cofrinho não encontrado")
    return piggy_bank


@router.delete("/{piggy_bank_id}", response_model=PiggyBankResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def remove_piggy_bank(
    request: Request,
    piggy_bank_id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    piggy_bank = delete_piggy_bank(db=db, piggy_bank_id=piggy_bank_id, user_id=user_id)
    if piggy_bank is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cofrinho não encontrado")
    return piggy_bank
