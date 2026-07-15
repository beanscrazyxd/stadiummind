"""
Fakes real-time sensor/IoT data so the rest of the app has something live to react to.
No hardware, no cameras - just believable numbers that drift over time.
"""

import random
import threading
import time

live_state = {
    "gates": {},        # gate_id -> {"queue_minutes": int, "density_pct": int}
    "amenities": {},    # amenity_id -> {"queue_minutes": int}
    "incidents": [],    # list of dicts, most recent first
}

_gate_ids = ["A", "B", "C", "D"]
_amenity_ids = ["R1", "R2", "R3", "R4", "F1", "F2", "F3"]


def _init_state():
    for g in _gate_ids:
        live_state["gates"][g] = {"queue_minutes": random.randint(2, 10), "density_pct": random.randint(20, 60)}
    for a in _amenity_ids:
        live_state["amenities"][a] = {"queue_minutes": random.randint(1, 8)}


def _drift():
    for g in _gate_ids:
        s = live_state["gates"][g]
        s["queue_minutes"] = max(0, min(45, s["queue_minutes"] + random.randint(-2, 3)))
        s["density_pct"] = max(0, min(100, s["density_pct"] + random.randint(-5, 7)))
    for a in _amenity_ids:
        s = live_state["amenities"][a]
        s["queue_minutes"] = max(0, min(20, s["queue_minutes"] + random.randint(-1, 2)))


def _loop():
    _init_state()
    while True:
        time.sleep(5)
        _drift()


def start_simulator():
    t = threading.Thread(target=_loop, daemon=True)
    t.start()


def trigger_incident(location: str, incident_type: str):
    """Manually spike the data to simulate an incident for the demo."""
    if location in live_state["gates"]:
        live_state["gates"][location]["density_pct"] = 95
        live_state["gates"][location]["queue_minutes"] = 40
    incident = {
        "location": location,
        "type": incident_type,
        "timestamp": time.time(),
    }
    live_state["incidents"].insert(0, incident)
    return incident
