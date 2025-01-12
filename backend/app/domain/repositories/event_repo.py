from abc import ABC, abstractmethod
from typing import List
from domain.models.event import Event

class EventRepository(ABC):
    @abstractmethod
    async def get_events(self) -> List[Event]:
        pass
    @abstractmethod
    async def add_event(self,added_event : Event) -> Event:
        pass
    @abstractmethod
    async def update_event(self,updated_event : Event) -> Event:
        pass
