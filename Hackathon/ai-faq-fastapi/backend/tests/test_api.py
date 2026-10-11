import pytest
from fastapi.testclient import TestClient
from app.main import app, seed_demo_data
from app.database import Base, engine, SessionLocal
from app.models import BusinessUser
from app.auth import hash_password

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    seed_demo_data()
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_user_login(client):
    response = client.post("/api/auth/login", json={
        "email": "admin@business.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == "admin@business.com"

def test_chat_query(client):
    response = client.post("/api/chat/ask", json={
        "business_id": "demo-user-id-101",
        "message": "What are your business operating hours?"
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 5

def test_capture_lead(client):
    response = client.post("/api/leads/capture", json={
        "business_id": "demo-user-id-101",
        "name": "Jane Student",
        "email": "student@university.edu",
        "phone": "+15551234567",
        "notes": "Testing python fast API integration"
    })
    assert response.status_code == 200
    assert response.json()["success"] is True
