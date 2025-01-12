from typing import List
from domain.models.event import Event
from domain.repositories.event_repo import EventRepository
from dtos.event_dto import EventDTO

class EventService:
    def __init__(self, event_repo: EventRepository):
        self.event_repo = event_repo

    async def list_events(self) -> List[Event]:
        return await self.event_repo.get_events()
    
    async def create_event(self, event : EventDTO) -> Event:
        added_events : Event = Event(
            id= 2,
            name=event.name,
            description= event.description,
            capacity=event.capacity,
            start_date= event.start_date,
            category=event.category,
            end_date= event.end_date,
            location= event.location,
        )
        return await self.event_repo.add_event(added_events)
    
    async def update_event(self, event_id: int, updated_event: EventDTO) -> Event:
        events = await self.event_repo.get_events()
        filtered_events = list(filter(lambda x: x.id == event_id, events))
        event_to_update : Event = filtered_events[0] if filtered_events else None

        if event_to_update is None:
            raise ValueError(f"Event with ID {event_id} not found")
        
        event_to_update.name = updated_event.name
        event_to_update.description = updated_event.description
        event_to_update.capacity = updated_event.capacity
        event_to_update.start_date = updated_event.start_date
        event_to_update.category = updated_event.category
        event_to_update.end_date = updated_event.end_date
        event_to_update.location = updated_event.location
        
        return await self.event_repo.update_event(event_to_update)
        
