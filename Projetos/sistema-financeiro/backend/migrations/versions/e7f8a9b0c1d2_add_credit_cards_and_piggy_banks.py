"""add credit cards and piggy banks

Revision ID: e7f8a9b0c1d2
Revises: c3d4e5f6a7b8
Create Date: 2026-05-17 17:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e7f8a9b0c1d2"
down_revision: Union[str, Sequence[str], None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "credit_cards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("brand", sa.String(length=50), nullable=False, server_default="outro"),
        sa.Column("last_four", sa.String(length=4), nullable=False),
        sa.Column("closing_day", sa.Integer(), nullable=False),
        sa.Column("due_day", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_credit_cards_id"), "credit_cards", ["id"], unique=False)
    op.create_index(op.f("ix_credit_cards_user_id"), "credit_cards", ["user_id"], unique=False)

    op.create_table(
        "piggy_banks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("target_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("current_amount", sa.Numeric(12, 2), nullable=False, server_default="0.00"),
        sa.Column("created_at", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_piggy_banks_id"), "piggy_banks", ["id"], unique=False)
    op.create_index(op.f("ix_piggy_banks_user_id"), "piggy_banks", ["user_id"], unique=False)

    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.add_column(sa.Column("credit_card_id", sa.Integer(), nullable=True))
        batch_op.create_index(batch_op.f("ix_transactions_credit_card_id"), ["credit_card_id"], unique=False)
        batch_op.create_foreign_key(
            "fk_transactions_credit_card_id_credit_cards",
            "credit_cards",
            ["credit_card_id"],
            ["id"],
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("transactions", recreate="always") as batch_op:
        batch_op.drop_constraint("fk_transactions_credit_card_id_credit_cards", type_="foreignkey")
        batch_op.drop_index(batch_op.f("ix_transactions_credit_card_id"))
        batch_op.drop_column("credit_card_id")

    op.drop_index(op.f("ix_piggy_banks_user_id"), table_name="piggy_banks")
    op.drop_index(op.f("ix_piggy_banks_id"), table_name="piggy_banks")
    op.drop_table("piggy_banks")

    op.drop_index(op.f("ix_credit_cards_user_id"), table_name="credit_cards")
    op.drop_index(op.f("ix_credit_cards_id"), table_name="credit_cards")
    op.drop_table("credit_cards")
