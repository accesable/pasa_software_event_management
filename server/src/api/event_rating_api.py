from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from application.event_rating_service import EventRatingService
from infrastructure.database import get_db_connection
from infrastructure.event_rating_repository import EventRatingRepository

router = APIRouter()

# Request and Response Models
class EventRatingRequest(BaseModel):
    event_id: str
    rating: int
    comment: str

class EventRatingResponse(BaseModel):
    event_id: str
    rating: int
    comment: str

def get_service(connection=Depends(get_db_connection)):
    repository = EventRatingRepository(connection)
    return EventRatingService(repository)

@router.post("/event-ratings", response_model=EventRatingResponse, status_code=201)
def create_event_rating(event_rating: EventRatingRequest, service: EventRatingService = Depends(get_service)):
    if not (1 <= event_rating.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    service.create_event_rating(event_rating.event_id, event_rating.rating, event_rating.comment)
    return {
        "event_id": event_rating.event_id,
        "rating": event_rating.rating,
        "comment": event_rating.comment,
    }

@router.get("/event-ratings", response_model=list[EventRatingResponse])
def list_event_ratings(service: EventRatingService = Depends(get_service)):
    ratings = service.list_event_ratings()
    return [{"event_id": r.event_id, "rating": r.rating, "comment": r.comment} for r in ratings]

@router.get("/event-ratings/{event_id}", response_model=EventRatingResponse)
def get_event_rating(event_id: str, service: EventRatingService = Depends(get_service)):
    rating = service.get_event_rating(event_id)
    if not rating:
        raise HTTPException(status_code=404, detail="Event rating not found")
    return {
        "event_id": rating.event_id,
        "rating": rating.rating,
        "comment": rating.comment,
    }
