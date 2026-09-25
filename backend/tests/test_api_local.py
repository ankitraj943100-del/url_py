import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_dashboard_summary():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "active_incidents" in data
    assert len(data["active_incidents"]) > 0
    assert data["active_incidents"][0]["id"] == "INC-1042"

@pytest.mark.asyncio
async def test_incident_details():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/incidents/INC-1042")
    assert response.status_code == 200
    data = response.json()
    assert data["incident"]["id"] == "INC-1042"
    assert data["incident"]["severity"] == "critical"
    assert len(data["events"]) > 0
    assert data["remediation"]["id"] == "rem-9021"

@pytest.mark.asyncio
async def test_investigate_workflow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/incidents/INC-1042/investigate")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "investigation_completed"
    assert "state" in data
    assert data["state"]["root_cause"]["confidence_level"] == "High confidence"
