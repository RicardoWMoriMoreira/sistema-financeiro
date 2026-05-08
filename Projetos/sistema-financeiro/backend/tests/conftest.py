import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.dependencies import get_db
from app.main import app


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def sample_category(client):
    response = client.post(
        "/categories",
        json={"name": "Alimentação", "type": "expense"},
    )
    return response.json()


@pytest.fixture
def sample_income_category(client):
    response = client.post(
        "/categories",
        json={"name": "Salário", "type": "income"},
    )
    return response.json()


@pytest.fixture
def sample_transaction(client, sample_category):
    response = client.post(
        "/transactions",
        json={
            "description": "Compra no mercado",
            "amount": "150.00",
            "type": "expense",
            "category_id": sample_category["id"],
            "date": "2026-05-07",
        },
    )
    return response.json()


@pytest.fixture
def sample_user(client):
    response = client.post(
        "/users/register",
        json={
            "name": "Usuário Teste",
            "email": "teste@email.com",
            "password": "senha123",
        },
    )
    return response.json()
