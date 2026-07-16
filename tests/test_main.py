"""Regression tests for StadiumMind's public API and mock LLM mode."""

import os

os.environ.setdefault("PROVIDER", "mock")

from fastapi.testclient import TestClient

import llm_client
from main import MAX_MESSAGE_LEN, app

client = TestClient(app)


def test_health_reports_provider():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "provider" in response.json()


def test_ops_status_returns_gates_and_amenities():
    response = client.get("/ops/status")
    assert response.status_code == 200
    assert "gates" in response.json()
    assert "amenities" in response.json()


def test_fan_chat_happy_path():
    response = client.post("/fan/chat", json={"message": "Where is the nearest restroom?"})
    assert response.status_code == 200
    assert isinstance(response.json()["answer"], str)


def test_fan_chat_rejects_empty_or_oversized_message():
    assert client.post("/fan/chat", json={"message": ""}).status_code == 422
    assert client.post("/fan/chat", json={"message": "x" * (MAX_MESSAGE_LEN + 1)}).status_code == 422


def test_ops_query_happy_path_and_validation():
    assert client.post("/ops/query", json={"question": "Which gate needs staff?"}).status_code == 200
    assert client.post("/ops/query", json={"question": ""}).status_code == 422


def test_trigger_incident_happy_path():
    response = client.post("/safety/trigger_incident", json={"location": "A", "incident_type": "overcrowding"})
    assert response.status_code == 200
    assert "incident" in response.json()
    assert "response_plan" in response.json()


def test_trigger_incident_rejects_invalid_values():
    assert client.post("/safety/trigger_incident", json={"location": "Z", "incident_type": "medical"}).status_code == 400
    assert client.post("/safety/trigger_incident", json={"location": "A", "incident_type": "zombies"}).status_code == 400


def test_cors_rejects_unlisted_origin():
    response = client.get("/health", headers={"Origin": "https://evil.example.com"})
    assert response.headers.get("access-control-allow-origin") != "https://evil.example.com"


def test_mock_llm_routing_and_cache():
    assert "1." in llm_client.ask_llm("You are a stadium safety coordinator.", "test incident")
    assert "Recommended action" in llm_client.ask_llm("You are an operations assistant for stadium staff.", "status?")
    before = len(llm_client._cache)
    llm_client.ask_llm("system X", "identical question")
    llm_client.ask_llm("system X", "identical question")
    assert len(llm_client._cache) == before + 1
