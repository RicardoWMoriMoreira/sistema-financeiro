from typing import Optional

from sqlalchemy.orm import Session

from app.repositories import credit_card_repository
from app.schemas.credit_card import CreditCardCreate, CreditCardResponse, CreditCardUpdate


def list_credit_cards(
    db: Session,
    user_id: Optional[int] = None,
) -> list[CreditCardResponse]:
    cards = credit_card_repository.list_credit_cards(db=db, user_id=user_id)
    return [CreditCardResponse.model_validate(card) for card in cards]


def find_credit_card_by_id(
    db: Session,
    card_id: int,
    user_id: Optional[int] = None,
) -> CreditCardResponse | None:
    card = credit_card_repository.find_credit_card_by_id(db=db, card_id=card_id, user_id=user_id)
    if card is None:
        return None
    return CreditCardResponse.model_validate(card)


def create_credit_card(
    db: Session,
    payload: CreditCardCreate,
    user_id: Optional[int] = None,
) -> CreditCardResponse:
    card = credit_card_repository.create_credit_card(db=db, payload=payload, user_id=user_id)
    return CreditCardResponse.model_validate(card)


def update_credit_card(
    db: Session,
    card_id: int,
    payload: CreditCardUpdate,
    user_id: Optional[int] = None,
) -> CreditCardResponse | None:
    card = credit_card_repository.update_credit_card(
        db=db,
        card_id=card_id,
        payload=payload,
        user_id=user_id,
    )
    if card is None:
        return None
    return CreditCardResponse.model_validate(card)


def toggle_credit_card(
    db: Session,
    card_id: int,
    user_id: Optional[int] = None,
) -> CreditCardResponse | None:
    card = credit_card_repository.toggle_credit_card(db=db, card_id=card_id, user_id=user_id)
    if card is None:
        return None
    return CreditCardResponse.model_validate(card)


def delete_credit_card(
    db: Session,
    card_id: int,
    user_id: Optional[int] = None,
) -> CreditCardResponse | None:
    card = credit_card_repository.delete_credit_card(db=db, card_id=card_id, user_id=user_id)
    if card is None:
        return None
    return CreditCardResponse.model_validate(card)
