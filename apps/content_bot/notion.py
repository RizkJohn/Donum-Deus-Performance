from __future__ import annotations

import logging
from typing import Any

import httpx

log = logging.getLogger(__name__)

_NOTION_VERSION = "2022-06-28"
_PAGES_URL = "https://api.notion.com/v1/pages"
_CHUNK = 2000  # Notion rich_text per-object character limit


def _rt(text: str) -> list[dict]:
    """Split text into Notion rich_text objects (max 2000 chars each)."""
    if not text:
        return [{"type": "text", "text": {"content": ""}}]
    return [
        {"type": "text", "text": {"content": text[i : i + _CHUNK]}}
        for i in range(0, len(text), _CHUNK)
    ]


def _paragraph_blocks(text: str) -> list[dict]:
    """Convert a multi-paragraph string into Notion paragraph block objects."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return [{"object": "block", "type": "paragraph", "paragraph": {"rich_text": []}}]
    blocks = []
    for line in lines:
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {"rich_text": _rt(line)},
        })
    return blocks


def _h2(text: str) -> dict:
    return {
        "object": "block",
        "type": "heading_2",
        "heading_2": {"rich_text": [{"type": "text", "text": {"content": text}}]},
    }


def save_post(
    *,
    api_key: str,
    database_id: str,
    platform: str,
    content_type: str,
    post: dict,
) -> str:
    """Create a page in the Notion content calendar database.

    Returns the new page URL, or an empty string on failure (caller logs the error).
    """
    abbr = {"Instagram": "IG", "TikTok": "TT", "Threads": "TH"}.get(platform, platform[:2].upper())
    topic = (post.get("topic") or "Untitled").strip()
    title = f"{topic[:56].rstrip()} — {abbr}"

    hashtags = " ".join(
        f"#{tag.lstrip('#')}" for tag in post.get("hashtags", [])
    )
    hook = post.get("hook", "")
    body = post.get("body", "")
    cta = post.get("cta", "")
    visual = post.get("visualNote", "")

    properties: dict[str, Any] = {
        "Title": {"title": _rt(title)},
        "Status": {"select": {"name": "Idea"}},
        "Platform": {"select": {"name": platform}},
        "Type": {"select": {"name": content_type}},
        "Hook": {"rich_text": _rt(hook)},
        "Body": {"rich_text": _rt(body[:2000])},  # property preview; full body lives in blocks
        "CTA": {"rich_text": _rt(cta)},
        "Hashtags": {"rich_text": _rt(hashtags)},
        "Visual Note": {"rich_text": _rt(visual)},
    }

    children = [
        _h2("🎯 Hook"),
        *_paragraph_blocks(hook),
        _h2("📝 Body"),
        *_paragraph_blocks(body),
        _h2("📣 Call To Action"),
        *_paragraph_blocks(cta),
        _h2("🏷️ Hashtags"),
        *_paragraph_blocks(hashtags),
        _h2("🎬 Visual Direction"),
        *_paragraph_blocks(visual),
    ]

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Notion-Version": _NOTION_VERSION,
        "Content-Type": "application/json",
    }

    resp = httpx.post(
        _PAGES_URL,
        json={"parent": {"database_id": database_id}, "properties": properties, "children": children},
        headers=headers,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json().get("url", "")
