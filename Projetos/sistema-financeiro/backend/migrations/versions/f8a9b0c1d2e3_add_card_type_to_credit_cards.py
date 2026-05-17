"""add card type to credit cards

Revision ID: f8a9b0c1d2e3
Revises: e7f8a9b0c1d2
Create Date: 2026-05-17 19:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f8a9b0c1d2e3"
down_revision: Union[str, Sequence[str], None] = "e7f8a9b0c1d2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "credit_cards",
        sa.Column(
            "card_type",
            sa.String(length=20),
            nullable=False,
            server_default="credit",
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("credit_cards", "card_type")
