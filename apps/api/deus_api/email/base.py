"""Email provider interface."""

from typing import Protocol, runtime_checkable


@runtime_checkable
class EmailProvider(Protocol):
    async def send_magic_link(self, *, to: str, link: str) -> None: ...
