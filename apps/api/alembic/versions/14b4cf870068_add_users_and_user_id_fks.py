"""add_users_and_user_id_fks

Revision ID: 14b4cf870068
Revises: d2b79a7fe1e5
Create Date: 2026-06-14 03:18:09.885255

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '14b4cf870068'
down_revision: Union[str, Sequence[str], None] = 'd2b79a7fe1e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=320), nullable=False),
        sa.Column('subscription_tier', sa.String(length=32), nullable=False, server_default='free'),
        sa.Column('stripe_customer_id', sa.String(length=64), nullable=True),
        sa.Column('subscribed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email', name='uq_users_email'),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    with op.batch_alter_table('leads', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.String(length=36), nullable=True))
        batch_op.create_foreign_key('fk_leads_user_id', 'users', ['user_id'], ['id'])

    with op.batch_alter_table('program_runs', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.String(length=36), nullable=True))
        batch_op.create_foreign_key('fk_program_runs_user_id', 'users', ['user_id'], ['id'])


def downgrade() -> None:
    with op.batch_alter_table('program_runs', schema=None) as batch_op:
        batch_op.drop_constraint('fk_program_runs_user_id', type_='foreignkey')
        batch_op.drop_column('user_id')

    with op.batch_alter_table('leads', schema=None) as batch_op:
        batch_op.drop_constraint('fk_leads_user_id', type_='foreignkey')
        batch_op.drop_column('user_id')

    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
