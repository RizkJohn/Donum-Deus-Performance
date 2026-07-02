import pytest

from conftest import make_request, subscribe


@pytest.mark.asyncio
async def test_disposable_email_rejected(client):
    r = await client.post(
        "/v1/assess",
        json={"email": "someone@mailinator.com", "payload": make_request().model_dump()},
    )
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_gmail_dot_and_plus_aliases_share_one_free_program(client):
    body = {"payload": make_request().model_dump()}

    r1 = await client.post("/v1/assess", json={**body, "email": "jane.doe@gmail.com"})
    assert r1.status_code == 200

    # Same inbox, three different-looking addresses -- all collapse to one
    # identity for the free-program gate (see billing/access.py:_gate_identity).
    for alias in ("janedoe@gmail.com", "jane.doe+workout@gmail.com", "j.a.n.e.doe@gmail.com"):
        r = await client.post("/v1/assess", json={**body, "email": alias})
        assert r.status_code == 402, f"{alias} should not get a second free program"


@pytest.mark.asyncio
async def test_plus_alias_blocked_on_non_gmail_domain_too(client):
    body = {"payload": make_request().model_dump()}
    r1 = await client.post("/v1/assess", json={**body, "email": "athlete@fastmail.com"})
    assert r1.status_code == 200
    r2 = await client.post("/v1/assess", json={**body, "email": "athlete+2@fastmail.com"})
    assert r2.status_code == 402


@pytest.mark.asyncio
async def test_unrelated_gmail_addresses_each_get_their_own_free_program(client):
    body = {"payload": make_request().model_dump()}
    r1 = await client.post("/v1/assess", json={**body, "email": "alpha.person@gmail.com"})
    assert r1.status_code == 200
    # A genuinely different local part is a different person, not an alias.
    r2 = await client.post("/v1/assess", json={**body, "email": "beta.person@gmail.com"})
    assert r2.status_code == 200


@pytest.mark.asyncio
async def test_per_ip_free_program_velocity_cap(client):
    body = {"payload": make_request().model_dump()}

    for i in range(3):
        r = await client.post("/v1/assess", json={**body, "email": f"person{i}@distinct-{i}.example"})
        assert r.status_code == 200, f"grant {i} should succeed"

    # A 4th distinct, non-aliased email from the same (test) IP within the cap.
    r4 = await client.post("/v1/assess", json={**body, "email": "person4@distinct-4.example"})
    assert r4.status_code == 402


@pytest.mark.asyncio
async def test_subscribed_user_exempt_from_disposable_and_ip_checks(client, monkeypatch):
    """A paying subscriber must never be locked out by a free-tier abuse
    heuristic -- not the disposable-domain check, not the per-IP cap."""
    email = "athlete@mailinator.com"
    await subscribe(client, monkeypatch, email)

    r = await client.post("/v1/assess", json={"email": email, "payload": make_request().model_dump()})
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_unsatisfiable_result_does_not_count_against_ip_cap(client):
    # Same scenario as test_routes.py's equivalent free-program test, but
    # verifying it doesn't burn into the per-IP velocity budget either.
    payload = make_request(training_age="Beginner", available_days=["Monday"]).model_dump()
    for i in range(5):
        r = await client.post(
            "/v1/assess", json={"email": f"noprogram{i}@distinct-np-{i}.example", "payload": payload}
        )
        assert r.status_code == 200
        assert "error" in r.json()["program"]

    # The cap (3) would have tripped by now if error results counted.
    r_ok = await client.post(
        "/v1/assess",
        json={"email": "finally@distinct-ok.example", "payload": make_request().model_dump()},
    )
    assert r_ok.status_code == 200
