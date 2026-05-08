"""link transactions to categories

Revision ID: 4c20d448edb2
Revises: a433b59dc32b
Create Date: 2026-05-05 12:29:17.012762

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4c20d448edb2'
down_revision: Union[str, Sequence[str], None] = 'a433b59dc32b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.add_column(
            sa.Column("category_id", sa.Integer(), nullable=True)
        )
        batch_op.create_index(
            "ix_transactions_category_id",
            ["category_id"],
            unique=False,
        )
        batch_op.create_foreign_key(
            "fk_transactions_category_id_categories",
            "categories",
            ["category_id"],
            ["id"],
        )
        batch_op.drop_column("category")


def downgrade() -> None:
    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.add_column(
            sa.Column("category", sa.String(length=100), nullable=True)
        )
        batch_op.drop_constraint(
            "fk_transactions_category_id_categories",
            type_="foreignkey",
        )
        batch_op.drop_index("ix_transactions_category_id")
        batch_op.drop_column("category_id")
