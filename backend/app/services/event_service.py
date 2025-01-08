from typing import List
from domain.models.event import Event
from domain.repositories.event_repo import EventRepository

class EventService:
    def __init__(self, event_repo: EventRepository):
        self.event_repo = event_repo

    async def list_events(self) -> List[Event]:
        return await self.event_repo.get_events()
