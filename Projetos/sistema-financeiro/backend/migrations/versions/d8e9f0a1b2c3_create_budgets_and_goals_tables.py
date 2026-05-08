"""create budgets and goals tables

Revision ID: d8e9f0a1b2c3
Revises: c7f8a9b0e1d2
Create Date: 2026-05-07 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd8e9f0a1b2c3'
down_revision: Union[str, Sequence[str], None] = 'c7f8a9b0e1d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'budgets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('month', sa.String(length=7), nullable=False),
        sa.Column('amount_limit', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('created_at', sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_budgets_id'),
        'budgets',
        ['id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_budgets_user_id'),
        'budgets',
        ['user_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_budgets_category_id'),
        'budgets',
        ['category_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_budgets_month'),
        'budgets',
        ['month'],
        unique=False,
    )

    op.create_table(
        'goals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('target_amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('current_amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('deadline', sa.Date(), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.Date(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_goals_id'),
        'goals',
        ['id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_goals_user_id'),
        'goals',
        ['user_id'],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_goals_user_id'), table_name='goals')
    op.drop_index(op.f('ix_goals_id'), table_name='goals')
    op.drop_table('goals')

    op.drop_index(op.f('ix_budgets_month'), table_name='budgets')
    op.drop_index(op.f('ix_budgets_category_id'), table_name='budgets')
    op.drop_index(op.f('ix_budgets_user_id'), table_name='budgets')
    op.drop_index(op.f('ix_budgets_id'), table_name='budgets')
    op.drop_table('budgets')
