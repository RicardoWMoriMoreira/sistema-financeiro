import hashlib

from app.services.user_service import hash_password, verify_password


def test_register_user(client):
    response = client.post(
        "/users/register",
        json={
            "name": "João Silva",
            "email": "joao@email.com",
            "password": "senha123",
        },
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["name"] == "João Silva"
    assert data["user"]["email"] == "joao@email.com"
    assert "password" not in data["user"]
    assert data["message"] == "Usuário cadastrado com sucesso."


def test_register_user_duplicate_email(client, sample_user):
    response = client.post(
        "/users/register",
        json={
            "name": "Outro Usuário",
            "email": "teste@email.com",
            "password": "outrasenha",
        },
    )
    
    assert response.status_code == 400
    assert "já está cadastrado" in response.json()["detail"]


def test_register_user_invalid_email(client):
    response = client.post(
        "/users/register",
        json={
            "name": "Teste",
            "email": "emailinvalido",
            "password": "senha123",
        },
    )
    
    assert response.status_code == 422


def test_register_user_short_password(client):
    response = client.post(
        "/users/register",
        json={
            "name": "Teste",
            "email": "teste2@email.com",
            "password": "123",
        },
    )
    
    assert response.status_code == 422


def test_login_user(client, sample_user):
    response = client.post(
        "/users/login",
        json={
            "email": "teste@email.com",
            "password": "senha123",
        },
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "teste@email.com"
    assert data["message"] == "Login realizado com sucesso."


def test_login_user_wrong_password(client, sample_user):
    response = client.post(
        "/users/login",
        json={
            "email": "teste@email.com",
            "password": "senhaerrada",
        },
    )
    
    assert response.status_code == 401


def test_login_user_not_found(client):
    response = client.post(
        "/users/login",
        json={
            "email": "naoexiste@email.com",
            "password": "senha123",
        },
    )
    
    assert response.status_code == 401


def test_hash_password_uses_pbkdf2_format():
    password_hash = hash_password("senha-segura")

    assert password_hash.startswith("pbkdf2_sha256$")
    assert verify_password("senha-segura", password_hash)


def test_verify_password_accepts_legacy_sha256_hash():
    legacy_hash = hashlib.sha256("senha-legada".encode("utf-8")).hexdigest()

    assert verify_password("senha-legada", legacy_hash)
