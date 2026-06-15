from __future__ import annotations

import os
from dataclasses import dataclass
from typing import List


@dataclass
class Config:
    anthropic_api_key: str
    notion_api_key: str
    notion_database_id: str
    platforms: List[str]
    content_types: List[str]
    posts_per_run: int
    schedule_cron: str
    log_level: str


def load_config() -> Config:
    return Config(
        anthropic_api_key=os.environ["ANTHROPIC_API_KEY"],
        notion_api_key=os.environ["NOTION_API_KEY"],
        notion_database_id=os.environ.get(
            "NOTION_DATABASE_ID", "88bf899d-a0aa-4c8a-9d24-c243a87008f3"
        ),
        platforms=os.environ.get("PLATFORMS", "Instagram,TikTok,Threads").split(","),
        content_types=os.environ.get("CONTENT_TYPES", "Motivational,Educational").split(","),
        posts_per_run=int(os.environ.get("POSTS_PER_RUN", "6")),
        schedule_cron=os.environ.get("SCHEDULE_CRON", "0 8 * * *"),
        log_level=os.environ.get("LOG_LEVEL", "INFO"),
    )
