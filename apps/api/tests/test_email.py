import pytest

from deus_api.email.factory import build_email_provider
from deus_api.email.mock import MockEmailProvider
from deus_api.email.resend_provider import ResendEmailProvider
from deus_api.email.templates import program_ready_email, welcome_email


@pytest.mark.asyncio
async def test_mock_provider_records_outbox():
    provider = MockEmailProvider()
    result = await provider.send(to="a@b.com", subject="hi", html="<p>hi</p>")
    assert result.sent
    assert provider.outbox == [{"to": "a@b.com", "subject": "hi", "html": "<p>hi</p>"}]


def test_factory_defaults_to_mock(settings):
    assert build_email_provider(settings).name == "mock"


def test_factory_builds_resend_provider(settings):
    settings_dict = settings.model_dump()
    settings_dict["email_provider"] = "resend"
    settings_dict["resend_api_key"] = "re_test"
    from deus_api.config import Settings

    provider = build_email_provider(Settings(**settings_dict))
    assert isinstance(provider, ResendEmailProvider)


def test_factory_rejects_unknown_provider(settings):
    from deus_api.config import Settings

    settings_dict = settings.model_dump()
    settings_dict["email_provider"] = "carrier-pigeon"
    with pytest.raises(ValueError):
        build_email_provider(Settings(**settings_dict))


def test_welcome_email_shape():
    subject, html = welcome_email()
    assert subject
    assert "<html" not in html  # fragment, not a full document
    assert "Donum Dei" in html


def test_program_ready_email_links_to_program():
    subject, html = program_ready_email("run-123")
    assert "run-123" in html
    assert "/program/run-123" in html


@pytest.mark.asyncio
async def test_assess_route_sends_program_ready_email(client):
    from conftest import make_request

    from deus_api.email.factory import get_email_provider

    email = "delivery@example.com"
    r = await client.post(
        "/v1/assess", json={"email": email, "payload": make_request().model_dump()}
    )
    assert r.status_code == 200
    run_id = r.json()["id"]

    outbox = get_email_provider().outbox
    matches = [e for e in outbox if e["to"] == email and run_id in e["html"]]
    assert matches, f"expected a program-ready email for {run_id}, outbox={outbox}"
