"""add spending_profile to transactions

Revision ID: af12bc34de56
Revises: 9f1a2b3c4d5e
Create Date: 2026-05-07 14:58:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "af12bc34de56"
down_revision: Union[str, Sequence[str], None] = "9f1a2b3c4d5e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.add_column(
            sa.Column(
                "spending_profile",
                sa.String(length=20),
                nullable=False,
                server_default="variable",
            )
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.drop_column("spending_profile")
