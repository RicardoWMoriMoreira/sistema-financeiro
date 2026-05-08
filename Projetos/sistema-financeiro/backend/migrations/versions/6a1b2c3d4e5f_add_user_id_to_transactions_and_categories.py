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
    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.add_column(
            sa.Column("user_id", sa.Integer(), nullable=True)
        )
        batch_op.create_index(
            "ix_transactions_user_id",
            ["user_id"],
            unique=False,
        )
        batch_op.create_foreign_key(
            "fk_transactions_user_id_users",
            "users",
            ["user_id"],
            ["id"],
        )

    with op.batch_alter_table("categories", recreate="always") as batch_op:
        batch_op.add_column(
            sa.Column("user_id", sa.Integer(), nullable=True)
        )
        batch_op.create_index(
            "ix_categories_user_id",
            ["user_id"],
            unique=False,
        )
        batch_op.create_foreign_key(
            "fk_categories_user_id_users",
            "users",
            ["user_id"],
            ["id"],
        )
        batch_op.drop_constraint("uq_categories_name_type", type_="unique")
        batch_op.create_unique_constraint(
            "uq_categories_name_type_user_id",
            ["name", "type", "user_id"],
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("categories", recreate="always") as batch_op:
        batch_op.drop_constraint("uq_categories_name_type_user_id", type_="unique")
        batch_op.create_unique_constraint(
            "uq_categories_name_type",
            ["name", "type"],
        )
        batch_op.drop_constraint(
            "fk_categories_user_id_users",
            type_="foreignkey",
        )
        batch_op.drop_index("ix_categories_user_id")
        batch_op.drop_column("user_id")

    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.drop_constraint(
            "fk_transactions_user_id_users",
            type_="foreignkey",
        )
        batch_op.drop_index("ix_transactions_user_id")
        batch_op.drop_column("user_id")
