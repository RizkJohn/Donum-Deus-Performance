import pytest

from conftest import make_request, subscribe

# `client` fixture lives in conftest.py (shared across route test modules).


@pytest.mark.asyncio
async def test_healthz(client):
    r = await client.get("/healthz")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_generate_returns_program(client):
    r = await client.post("/v1/generate", json=make_request().model_dump())
    assert r.status_code == 200
    body = r.json()
    assert "weekly_split" in body and "sessions" in body


@pytest.mark.asyncio
async def test_generate_rejects_malformed_payload(client):
    r = await client.post("/v1/generate", json={"client_profile": {}})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_assess_and_fetch_roundtrip(client):
    r = await client.post("/v1/assess", json={
        "email": "athlete@example.com",
        "payload": make_request().model_dump(),
    })
    assert r.status_code == 200
    body = r.json()
    assert body["id"] and "weekly_split" in body["program"]

    # the revamp surfaces the coach's read + persistent state on assess
    assert body["assessment"] is not None
    assert "training_state" in body["assessment"]
    assert body["assessment"]["summary"]
    assert body["state_summary"]["cycle_count"] == 1

    r2 = await client.get(f"/v1/programs/{body['id']}")
    assert r2.status_code == 200
    fetched = r2.json()
    assert fetched["email"] == "athlete@example.com"
    assert fetched["program"] == body["program"]
    assert fetched["assessment"]["training_state"] == body["assessment"]["training_state"]
    assert fetched["state_summary"]["cycle_count"] == 1


@pytest.mark.asyncio
async def test_assess_accepts_preferences(client):
    payload = make_request().model_dump()
    payload["preferences"] = {
        "training_environment": "home",
        "preferred_modalities": ["dumbbells"],
        "exercise_aversions": ["barbell"],
        "novelty_tolerance": "high",
    }
    r = await client.post("/v1/assess", json={"email": "prefs@example.com", "payload": payload})
    assert r.status_code == 200
    assert r.json()["assessment"]["novelty_target"] >= 0.5


@pytest.mark.asyncio
async def test_persistent_state_accumulates_across_cycles(client, monkeypatch):
    email = "returning@example.com"
    body = {"email": email, "payload": make_request().model_dump()}

    r1 = await client.post("/v1/assess", json=body)
    assert r1.json()["state_summary"]["cycle_count"] == 1

    # A second program requires an active subscription (billing/access.py).
    await subscribe(client, monkeypatch, email)

    r2 = await client.post("/v1/assess", json=body)
    second = r2.json()
    # state is persistent and folds forward, not reset each time
    assert second["state_summary"]["cycle_count"] == 2
    assert sum(second["state_summary"]["recent_movement_patterns"].values()) > 0


@pytest.mark.asyncio
async def test_second_assessment_without_subscription_is_paywalled(client):
    email = "onefree@example.com"
    body = {"email": email, "payload": make_request().model_dump()}

    r1 = await client.post("/v1/assess", json=body)
    assert r1.status_code == 200

    r2 = await client.post("/v1/assess", json=body)
    assert r2.status_code == 402


@pytest.mark.asyncio
async def test_subscribed_athlete_gets_unlimited_programs(client, monkeypatch):
    email = "subscriber@example.com"
    body = {"email": email, "payload": make_request().model_dump()}

    r1 = await client.post("/v1/assess", json=body)
    assert r1.status_code == 200

    await subscribe(client, monkeypatch, email)

    r2 = await client.post("/v1/assess", json=body)
    assert r2.status_code == 200
    r3 = await client.post("/v1/assess", json=body)
    assert r3.status_code == 200


@pytest.mark.asyncio
async def test_unsatisfiable_first_result_does_not_spend_free_program(client):
    email = "unsatisfiable@example.com"
    # A single available day with a Beginner budget can't cover the required
    # weekly movement patterns -- see test_decision_engine.py's equivalent.
    payload = make_request(training_age="Beginner", available_days=["Monday"]).model_dump()

    r1 = await client.post("/v1/assess", json={"email": email, "payload": payload})
    assert r1.status_code == 200
    assert "error" in r1.json()["program"]

    # Still free: the engine declined to compromise, nothing was delivered.
    r2 = await client.post("/v1/assess", json={"email": email, "payload": payload})
    assert r2.status_code == 200
    assert "error" in r2.json()["program"]


@pytest.mark.asyncio
async def test_feedback_folds_into_state(client):
    email = "feedback@example.com"
    r = await client.post("/v1/assess", json={"email": email, "payload": make_request().model_dump()})
    run_id = r.json()["id"]

    fb = await client.post("/v1/feedback", json={
        "email": email,
        "run_id": run_id,
        "completion_pct": 0.3,
        "soreness": 5,
        "rpe_drift": 2.5,
    })
    assert fb.status_code == 200
    summary = fb.json()["state_summary"]
    assert summary["compliance_score"] < 1.0  # low completion drags compliance down


@pytest.mark.asyncio
async def test_feedback_unknown_run_404(client):
    r = await client.post("/v1/feedback", json={
        "email": "x@example.com", "run_id": "nope", "completion_pct": 1.0,
    })
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_erasure_removes_state_and_feedback(client):
    email = "erase@example.com"
    r = await client.post("/v1/assess", json={"email": email, "payload": make_request().model_dump()})
    run_id = r.json()["id"]
    await client.post("/v1/feedback", json={"email": email, "run_id": run_id, "completion_pct": 0.5})

    d = await client.request("DELETE", "/v1/data", json={"email": email})
    assert d.status_code == 200
    body = d.json()
    assert body["deleted_programs"] >= 1
    assert body["deleted_feedback"] >= 1
    assert body["deleted_athlete_state"] == 1


@pytest.mark.asyncio
async def test_fetch_unknown_program_404(client):
    r = await client.get("/v1/programs/nope")
    assert r.status_code == 404
