"""add payment_method to transactions

Revision ID: 9f1a2b3c4d5e
Revises: 6a1b2c3d4e5f, d8e9f0a1b2c3
Create Date: 2026-05-07 14:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9f1a2b3c4d5e"
down_revision: Union[str, Sequence[str], None] = ("6a1b2c3d4e5f", "d8e9f0a1b2c3")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.add_column(
            sa.Column(
                "payment_method",
                sa.String(length=20),
                nullable=False,
                server_default="pix",
            )
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.drop_column("payment_method")
