"""Tests for the live-state simulator."""

from simulator import live_state, trigger_incident


def test_live_state_has_expected_shape():
    assert {"gates", "amenities", "incidents"}.issubset(live_state)


def test_trigger_incident_appends_and_returns_record():
    before = len(live_state["incidents"])
    incident = trigger_incident("A", "medical")
    assert len(live_state["incidents"]) == before + 1
    assert incident["location"] == "A"
    assert incident["type"] == "medical"
    assert "timestamp" in incident
