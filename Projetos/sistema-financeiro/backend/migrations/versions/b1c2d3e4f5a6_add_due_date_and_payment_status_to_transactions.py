"""add due_date and payment_status to transactions

Revision ID: b1c2d3e4f5a6
Revises: af12bc34de56
Create Date: 2026-05-07 15:08:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b1c2d3e4f5a6"
down_revision: Union[str, Sequence[str], None] = "af12bc34de56"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.add_column(
            sa.Column("due_date", sa.Date(), nullable=True)
        )
        batch_op.add_column(
            sa.Column(
                "payment_status",
                sa.String(length=20),
                nullable=False,
                server_default="paid",
            )
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.drop_column("payment_status")
        batch_op.drop_column("due_date")
