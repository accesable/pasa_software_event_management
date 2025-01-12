from abc import ABC, abstractmethod
from typing import List
from domain.models.event_registration import EventRegistration

class EventRegistrationRepository(ABC):
    @abstractmethod
    async def get_registrations(self,event_id : int = None) -> List[EventRegistration]:
        pass
    @abstractmethod
    async def add_one_registration(self,added_event : EventRegistration) -> EventRegistration:
        pass
    @abstractmethod
    async def add_many_registration(self,added_events : List[EventRegistration]) -> List[EventRegistration]:
        pass
    @abstractmethod
    async def update_one_event(self,updated_event : EventRegistration) -> EventRegistration:
        pass
    @abstractmethod
    async def update_many_registration(self,updated_events : List[EventRegistration]) -> List[EventRegistration]:
        pass