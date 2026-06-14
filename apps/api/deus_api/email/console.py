"""Dev email provider — logs the magic link instead of sending email."""

import logging

logger = logging.getLogger("deus_api.email")


class ConsoleEmailProvider:
    async def send_magic_link(self, *, to: str, link: str) -> None:
        logger.info("MAGIC LINK for %s → %s", to, link)
        print(f"\n[DEV EMAIL] Magic link for {to}:\n  {link}\n")
