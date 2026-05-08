def test_create_category(client):
    response = client.post(
        "/categories",
        json={"name": "Transporte", "type": "expense"},
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Transporte"
    assert data["type"] == "expense"
    assert "id" in data


def test_create_category_invalid_type(client):
    response = client.post(
        "/categories",
        json={"name": "Teste", "type": "invalid"},
    )
    
    assert response.status_code == 422


def test_list_categories(client, sample_category):
    response = client.get("/categories")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(cat["name"] == "Alimentação" for cat in data)


def test_list_categories_by_type(client, sample_category, sample_income_category):
    response = client.get("/categories?type=expense")
    
    assert response.status_code == 200
    data = response.json()
    assert all(cat["type"] == "expense" for cat in data)


def test_get_category_by_id(client, sample_category):
    category_id = sample_category["id"]
    response = client.get(f"/categories/{category_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == category_id
    assert data["name"] == "Alimentação"


def test_get_category_not_found(client):
    response = client.get("/categories/99999")
    
    assert response.status_code == 404


def test_update_category(client, sample_category):
    category_id = sample_category["id"]
    response = client.put(
        f"/categories/{category_id}",
        json={"name": "Supermercado", "type": "expense"},
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Supermercado"


def test_delete_category(client, sample_category):
    category_id = sample_category["id"]
    response = client.delete(f"/categories/{category_id}")
    
    assert response.status_code == 200
    
    get_response = client.get(f"/categories/{category_id}")
    assert get_response.status_code == 404


def test_create_duplicate_category(client, sample_category):
    response = client.post(
        "/categories",
        json={"name": "Alimentação", "type": "expense"},
    )
    
    assert response.status_code == 409
