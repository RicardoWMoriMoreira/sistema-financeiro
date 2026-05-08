"""create recurring_transactions table

Revision ID: c7f8a9b0e1d2
Revises: 4c20d448edb2
Create Date: 2026-05-07 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c7f8a9b0e1d2'
down_revision: Union[str, Sequence[str], None] = '4c20d448edb2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'recurring_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('frequency', sa.String(length=20), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('next_occurrence', sa.Date(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('last_generated', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_recurring_transactions_id'),
        'recurring_transactions',
        ['id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_recurring_transactions_category_id'),
        'recurring_transactions',
        ['category_id'],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f('ix_recurring_transactions_category_id'),
        table_name='recurring_transactions',
    )
    op.drop_index(
        op.f('ix_recurring_transactions_id'),
        table_name='recurring_transactions',
    )
    op.drop_table('recurring_transactions')
