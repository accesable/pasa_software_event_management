from typing import List
from domain.models.event import Event
from domain.repositories.event_repo import EventRepository
from datetime import datetime
# Create a list of Event objects
events = [
    Event(id=1, name="Tech Conference 2025", location="New York", capacity=500, category="conference", 
          start_date=datetime(2025, 3, 1, 9, 0), end_date=datetime(2025, 3, 1, 17, 0)),
    Event(id=2, name="Art Expo", location="Paris", capacity=200, category="exhibition", 
          start_date=datetime(2025, 4, 10, 10, 0), end_date=datetime(2025, 4, 12, 18, 0)),
    Event(id=3, name="Music Festival", location="Los Angeles", capacity=1000, category="festival", 
          start_date=datetime(2025, 5, 15, 15, 0), end_date=datetime(2025, 5, 17, 23, 0)),
]

class EventRepositoryImpl(EventRepository):
    async def get_events(self) -> List[Event]:
        return events
    async def add_event(self,added_event : Event) -> Event:
        events.append(added_event)
        return added_event
    async def update_event(self,update_event : Event) -> Event:
        for event in events:
            if event.id == update_event.id:
                event.name = update_event.name
                event.location = update_event.location
                event.capacity = update_event.capacity
                event.category = update_event.category
                event.start_date = update_event.start_date
                event.end_date = update_event.end_date
                return event
        raise ValueError("Event not found")