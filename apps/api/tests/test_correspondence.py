import pytest

# `client` fixture lives in conftest.py.


@pytest.mark.asyncio
async def test_correspondence_forwards_to_contact_inbox(client):
    from deus_api.config import get_settings
    from deus_api.email.factory import get_email_provider

    r = await client.post(
        "/v1/correspondence",
        json={
            "given_name": "Ada",
            "family_name": "Lovelace",
            "email": "ada@example.com",
            "inquiry_type": "practice",
            "message": "Interested in Level II.",
        },
    )
    assert r.status_code == 202

    outbox = get_email_provider().outbox
    sent = next(e for e in outbox if e["to"] == get_settings().contact_email)
    assert sent["reply_to"] == "ada@example.com"
    assert "Ada" in sent["subject"]


@pytest.mark.asyncio
async def test_correspondence_escapes_html_in_message(client):
    from deus_api.email.factory import get_email_provider

    await client.post(
        "/v1/correspondence",
        json={
            "given_name": "Eve",
            "family_name": "Tester",
            "email": "eve@example.com",
            "message": "<script>alert(1)</script>",
        },
    )
    outbox = get_email_provider().outbox
    sent = outbox[-1]
    assert "<script>" not in sent["html"]
    assert "&lt;script&gt;" in sent["html"]


@pytest.mark.asyncio
async def test_correspondence_rejects_missing_fields(client):
    r = await client.post("/v1/correspondence", json={"given_name": "Ada"})
    assert r.status_code == 422
