def test_create_transaction(client, sample_category):
    response = client.post(
        "/transactions",
        json={
            "description": "Jantar",
            "amount": "50.00",
            "type": "expense",
            "category_id": sample_category["id"],
            "date": "2026-05-07",
        },
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["description"] == "Jantar"
    assert data["amount"] == "50.00"
    assert data["type"] == "expense"
    assert "id" in data


def test_create_transaction_invalid_category(client, sample_income_category):
    response = client.post(
        "/transactions",
        json={
            "description": "Teste",
            "amount": "100.00",
            "type": "expense",
            "category_id": sample_income_category["id"],
            "date": "2026-05-07",
        },
    )
    
    assert response.status_code == 400


def test_create_transaction_invalid_amount(client, sample_category):
    response = client.post(
        "/transactions",
        json={
            "description": "Teste",
            "amount": "-50.00",
            "type": "expense",
            "category_id": sample_category["id"],
            "date": "2026-05-07",
        },
    )
    
    assert response.status_code == 422


def test_list_transactions(client, sample_transaction):
    response = client.get("/transactions")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


def test_list_transactions_paginated(client, sample_transaction):
    response = client.get("/transactions/paginated?page=1&per_page=10")
    
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "per_page" in data
    assert "total_pages" in data
    assert data["page"] == 1


def test_list_transactions_by_type(client, sample_transaction):
    response = client.get("/transactions?type=expense")
    
    assert response.status_code == 200
    data = response.json()
    assert all(t["type"] == "expense" for t in data)


def test_list_transactions_by_date_range(client, sample_transaction):
    response = client.get(
        "/transactions?start_date=2026-05-01&end_date=2026-05-31"
    )
    
    assert response.status_code == 200


def test_list_transactions_invalid_date_range(client):
    response = client.get(
        "/transactions?start_date=2026-05-31&end_date=2026-05-01"
    )
    
    assert response.status_code == 400


def test_get_transaction_by_id(client, sample_transaction):
    transaction_id = sample_transaction["id"]
    response = client.get(f"/transactions/{transaction_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == transaction_id


def test_get_transaction_not_found(client):
    response = client.get("/transactions/99999")
    
    assert response.status_code == 404


def test_update_transaction(client, sample_transaction):
    transaction_id = sample_transaction["id"]
    response = client.put(
        f"/transactions/{transaction_id}",
        json={
            "description": "Compra atualizada",
            "amount": "200.00",
            "type": "expense",
            "category_id": sample_transaction["category_id"],
            "date": "2026-05-07",
        },
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "Compra atualizada"
    assert data["amount"] == "200.00"


def test_delete_transaction(client, sample_transaction):
    transaction_id = sample_transaction["id"]
    response = client.delete(f"/transactions/{transaction_id}")
    
    assert response.status_code == 200
    
    get_response = client.get(f"/transactions/{transaction_id}")
    assert get_response.status_code == 404


def test_get_transactions_summary(client, sample_transaction):
    response = client.get("/transactions/summary")
    
    assert response.status_code == 200
    data = response.json()
    assert "total_income" in data
    assert "total_expense" in data
    assert "balance" in data


def test_get_transactions_summary_with_filters(client, sample_transaction):
    response = client.get(
        "/transactions/summary?start_date=2026-05-01&end_date=2026-05-31"
    )
    
    assert response.status_code == 200
