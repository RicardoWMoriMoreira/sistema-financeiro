"""add installment fields to transactions

Revision ID: c3d4e5f6a7b8
Revises: b1c2d3e4f5a6
Create Date: 2026-05-07 15:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "b1c2d3e4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.add_column(sa.Column("installment_group_id", sa.String(length=36), nullable=True))
        batch_op.add_column(
            sa.Column("installment_number", sa.Integer(), nullable=False, server_default="1")
        )
        batch_op.add_column(
            sa.Column("installment_total", sa.Integer(), nullable=False, server_default="1")
        )
        batch_op.create_index("ix_transactions_installment_group_id", ["installment_group_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.drop_index("ix_transactions_installment_group_id")
        batch_op.drop_column("installment_total")
        batch_op.drop_column("installment_number")
        batch_op.drop_column("installment_group_id")
