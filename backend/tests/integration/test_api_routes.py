import pytest
from fastapi.testclient import TestClient
from main import app


def test_habits_endpoint(api_client: TestClient):
    """Test the /habits endpoint"""
    response = api_client.get("/habits?user_id=123")
    assert response.status_code == 200
    data = response.json()
    assert "habits" in data
    assert isinstance(data["habits"], list)

def test_habits_endpoint_headers(api_client: TestClient):
    """Test that the /habits endpoint returns correct headers"""
    response = api_client.get("/habits?user_id=123")
    assert response.headers["content-type"] == "application/json"

def test_habits_endpoint_missing_user_id(api_client: TestClient):
    """Test the /habits endpoint when user_id is missing"""
    response = api_client.get("/habits")
    assert response.status_code == 422

@pytest.mark.parametrize(
    "http_method,endpoint",
    [
        ("get", "/invalid"),
        ("post", "/habits"),  # Assuming POST is not implemented
        ("put", "/habits"),   # Assuming PUT is not implemented
    ]
)
def test_invalid_routes(api_client: TestClient, http_method, endpoint):
    """Test invalid routes and methods"""
    method = getattr(api_client, http_method)
    response = method(endpoint)
    assert response.status_code in [404, 405]  # Either not found or method not allowed