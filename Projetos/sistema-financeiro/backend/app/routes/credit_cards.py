from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user_id, get_db
from app.rate_limiter import limiter, RATE_LIMIT_READ, RATE_LIMIT_WRITE
from app.schemas.credit_card import CreditCardCreate, CreditCardResponse, CreditCardUpdate
from app.services.credit_card_service import (
    create_credit_card,
    delete_credit_card,
    list_credit_cards,
    toggle_credit_card,
    update_credit_card,
)

router = APIRouter(
    prefix="/credit-cards",
    tags=["credit-cards"],
)


@router.get("", response_model=list[CreditCardResponse])
@limiter.limit(RATE_LIMIT_READ)
def get_credit_cards(
    request: Request,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    return list_credit_cards(db=db, user_id=user_id)


@router.post("", response_model=CreditCardResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(RATE_LIMIT_WRITE)
def post_credit_card(
    request: Request,
    payload: CreditCardCreate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    return create_credit_card(db=db, payload=payload, user_id=user_id)


@router.put("/{card_id}", response_model=CreditCardResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def put_credit_card(
    request: Request,
    card_id: int,
    payload: CreditCardUpdate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    card = update_credit_card(db=db, card_id=card_id, payload=payload, user_id=user_id)
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cartão não encontrado")
    return card


@router.patch("/{card_id}/toggle", response_model=CreditCardResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def patch_credit_card_toggle(
    request: Request,
    card_id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    card = toggle_credit_card(db=db, card_id=card_id, user_id=user_id)
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cartão não encontrado")
    return card


@router.delete("/{card_id}", response_model=CreditCardResponse)
@limiter.limit(RATE_LIMIT_WRITE)
def remove_credit_card(
    request: Request,
    card_id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    card = delete_credit_card(db=db, card_id=card_id, user_id=user_id)
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cartão não encontrado")
    return card
