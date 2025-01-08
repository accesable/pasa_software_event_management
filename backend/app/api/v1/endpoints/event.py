from fastapi import APIRouter, Depends
from services.event_service import EventService
from infrastructure.repositories.event_repo import EventRepositoryImpl
from dtos.event_dto import EventDTO
router = APIRouter()

@router.get("/events")
async def get_events():
    event_service = EventService(EventRepositoryImpl())
    return await event_service.list_events()

@router.post("/events")
async def post_event(event : EventDTO):
    return event

@router.put("/events")
async def put_event(event : EventDTO):
    return event