#!/usr/bin/env python3
"""Donum Dei Performance content bot.

Single-run (default):
    python bot.py

Daemon mode (runs on the cron schedule in SCHEDULE_CRON):
    python bot.py --daemon

Environment variables are loaded from a .env file if present.
"""
from __future__ import annotations

import argparse
import itertools
import logging
import sys
from datetime import datetime, timezone

from anthropic import Anthropic
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from dotenv import load_dotenv

from config import load_config
from generator import generate_post
from notion import save_post

load_dotenv()

log = logging.getLogger("donum_dei.bot")


def _setup_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
        stream=sys.stdout,
    )


def run_job(cfg, client: Anthropic) -> None:
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    log.info("=== Content generation run — %s ===", now)

    # Cycle through every platform × content_type combination evenly.
    combos = list(itertools.product(cfg.platforms, cfg.content_types))
    pair_cycle = itertools.cycle(combos)

    saved = 0
    failed = 0

    for i in range(cfg.posts_per_run):
        platform, content_type = next(pair_cycle)
        log.info("[%d/%d] %s · %s", i + 1, cfg.posts_per_run, platform, content_type)

        try:
            post = generate_post(client, platform, content_type)
            url = save_post(
                api_key=cfg.notion_api_key,
                database_id=cfg.notion_database_id,
                platform=platform,
                content_type=content_type,
                post=post,
            )
            log.info("  ✓ %r → %s", post.get("topic", "?"), url or "(no url)")
            saved += 1
        except Exception as exc:
            log.error("  ✗ %s · %s — %s", platform, content_type, exc)
            failed += 1

    log.info("=== Done: %d saved, %d failed ===", saved, failed)


def main() -> None:
    parser = argparse.ArgumentParser(description="Donum Dei Performance content bot")
    parser.add_argument(
        "--daemon",
        action="store_true",
        help="Run as a long-running scheduler instead of a one-shot",
    )
    args = parser.parse_args()

    cfg = load_config()
    _setup_logging(cfg.log_level)

    log.info(
        "Donum Dei Performance Content Bot | platforms=%s | types=%s | posts_per_run=%d",
        cfg.platforms,
        cfg.content_types,
        cfg.posts_per_run,
    )

    client = Anthropic(api_key=cfg.anthropic_api_key)

    if args.daemon:
        parts = cfg.schedule_cron.split()
        if len(parts) != 5:
            log.error("SCHEDULE_CRON must be 5 fields (minute hour day month day_of_week), got: %r", cfg.schedule_cron)
            sys.exit(1)

        minute, hour, day, month, day_of_week = parts
        trigger = CronTrigger(
            minute=minute,
            hour=hour,
            day=day,
            month=month,
            day_of_week=day_of_week,
            timezone="UTC",
        )

        scheduler = BlockingScheduler(timezone="UTC")
        scheduler.add_job(run_job, trigger, args=[cfg, client], name="content_generation")

        next_run = scheduler.get_jobs()[0].next_run_time
        log.info("Daemon mode | schedule=%r | next run: %s", cfg.schedule_cron, next_run)

        try:
            scheduler.start()
        except KeyboardInterrupt:
            log.info("Shutting down.")
    else:
        log.info("Single-run mode")
        run_job(cfg, client)


if __name__ == "__main__":
    main()
