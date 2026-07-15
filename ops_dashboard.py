import os
import requests
import streamlit as st

BACKEND = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="StadiumMind Ops", layout="wide")
st.title("StadiumMind — Ops Command Center")

if st.button("Refresh live data"):
    st.rerun()

status = requests.get(f"{BACKEND}/ops/status").json()

col1, col2 = st.columns(2)

with col1:
    st.subheader("Gates")
    for gate_id, s in status["gates"].items():
        st.metric(f"Gate {gate_id}", f"{s['density_pct']}% full", f"{s['queue_minutes']} min queue")

with col2:
    st.subheader("Amenities")
    for aid, s in status["amenities"].items():
        st.write(f"**{aid}** — {s['queue_minutes']} min queue")

if status["incidents"]:
    st.warning(f"Most recent incident: {status['incidents'][0]}")

st.divider()
st.subheader("Ask the AI ops assistant")
question = st.text_input("e.g. 'What's going on at Gate C?' or 'Where should I send extra staff?'")
if st.button("Ask") and question:
    with st.spinner("Thinking..."):
        resp = requests.post(f"{BACKEND}/ops/query", json={"question": question}).json()
    st.info(resp["answer"])

st.divider()
st.subheader("Simulate an incident (for demo)")
loc = st.selectbox("Gate", ["A", "B", "C", "D"])
itype = st.selectbox("Type", ["overcrowding", "medical", "security"])
if st.button("Trigger incident"):
    resp = requests.post(f"{BACKEND}/safety/trigger_incident", json={"location": loc, "incident_type": itype}).json()
    st.error("Incident triggered")
    st.write(resp["response_plan"])
