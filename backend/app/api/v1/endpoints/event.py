from fastapi import APIRouter, Depends
from services.event_service import EventService
from infrastructure.repositories.event_repo import EventRepositoryImpl
from dtos.event_dto import EventDTO
from domain.models.event import Event
router = APIRouter()

event_service = EventService(EventRepositoryImpl())
@router.get("/events")
async def get_events():
    return await event_service.list_events()

@router.post("/events")
async def post_event(event : EventDTO) -> Event:
    return await event_service.create_event(event)

@router.put("/events/{event_id}")
async def put_event(event_id : int,event : EventDTO) -> Event:
    return await event_service.update_event(event_id,event)