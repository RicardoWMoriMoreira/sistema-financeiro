from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.credit_card import CreditCardModel
from app.schemas.credit_card import CreditCardCreate, CreditCardUpdate


def list_credit_cards(
    db: Session,
    user_id: Optional[int] = None,
) -> list[CreditCardModel]:
    statement = select(CreditCardModel)

    if user_id is not None:
        statement = statement.where(CreditCardModel.user_id == user_id)

    statement = statement.order_by(CreditCardModel.is_active.desc(), CreditCardModel.name.asc())
    return list(db.scalars(statement).all())


def find_credit_card_by_id(
    db: Session,
    card_id: int,
    user_id: Optional[int] = None,
) -> CreditCardModel | None:
    statement = select(CreditCardModel).where(CreditCardModel.id == card_id)
    if user_id is not None:
        statement = statement.where(CreditCardModel.user_id == user_id)
    return db.scalars(statement).first()


def create_credit_card(
    db: Session,
    payload: CreditCardCreate,
    user_id: Optional[int] = None,
) -> CreditCardModel:
    card = CreditCardModel(
        name=payload.name,
        brand=payload.brand,
        last_four=payload.last_four,
        closing_day=payload.closing_day,
        due_day=payload.due_day,
        user_id=user_id,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def update_credit_card(
    db: Session,
    card_id: int,
    payload: CreditCardUpdate,
    user_id: Optional[int] = None,
) -> CreditCardModel | None:
    card = find_credit_card_by_id(db=db, card_id=card_id, user_id=user_id)
    if card is None:
        return None

    card.name = payload.name
    card.brand = payload.brand
    card.last_four = payload.last_four
    card.closing_day = payload.closing_day
    card.due_day = payload.due_day
    card.is_active = payload.is_active
    db.commit()
    db.refresh(card)
    return card


def toggle_credit_card(
    db: Session,
    card_id: int,
    user_id: Optional[int] = None,
) -> CreditCardModel | None:
    card = find_credit_card_by_id(db=db, card_id=card_id, user_id=user_id)
    if card is None:
        return None

    card.is_active = not card.is_active
    db.commit()
    db.refresh(card)
    return card


def delete_credit_card(
    db: Session,
    card_id: int,
    user_id: Optional[int] = None,
) -> CreditCardModel | None:
    card = find_credit_card_by_id(db=db, card_id=card_id, user_id=user_id)
    if card is None:
        return None
    db.delete(card)
    db.commit()
    return card
