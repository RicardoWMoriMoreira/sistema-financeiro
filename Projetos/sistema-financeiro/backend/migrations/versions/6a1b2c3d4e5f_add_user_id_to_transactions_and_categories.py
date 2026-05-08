"""add user_id to transactions and categories

Revision ID: 6a1b2c3d4e5f
Revises: 5d31e559fdc3
Create Date: 2026-05-07 12:58:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6a1b2c3d4e5f'
down_revision: Union[str, Sequence[str], None] = '5d31e559fdc3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("transactions", sa.Column("user_id", sa.Integer(), nullable=True))
    op.create_index("ix_transactions_user_id", "transactions", ["user_id"], unique=False)
    op.create_foreign_key(
        "fk_transactions_user_id_users",
        "transactions",
        "users",
        ["user_id"],
        ["id"],
    )

    op.add_column("categories", sa.Column("user_id", sa.Integer(), nullable=True))
    op.create_index("ix_categories_user_id", "categories", ["user_id"], unique=False)
    op.create_foreign_key(
        "fk_categories_user_id_users",
        "categories",
        "users",
        ["user_id"],
        ["id"],
    )
    op.drop_constraint("uq_categories_name_type", "categories", type_="unique")
    op.create_unique_constraint(
        "uq_categories_name_type_user_id",
        "categories",
        ["name", "type", "user_id"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("uq_categories_name_type_user_id", "categories", type_="unique")
    op.create_unique_constraint("uq_categories_name_type", "categories", ["name", "type"])
    op.drop_constraint("fk_categories_user_id_users", "categories", type_="foreignkey")
    op.drop_index("ix_categories_user_id", table_name="categories")
    op.drop_column("categories", "user_id")

    op.drop_constraint("fk_transactions_user_id_users", "transactions", type_="foreignkey")
    op.drop_index("ix_transactions_user_id", table_name="transactions")
    op.drop_column("transactions", "user_id")
