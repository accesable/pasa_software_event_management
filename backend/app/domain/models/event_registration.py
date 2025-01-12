from pydantic import BaseModel
from datetime import datetime

class EventRegistration(BaseModel):
    id: int
    event_id: int
    attendant_id: int
    role : str = "Attendee"
    created_at: datetime = datetime.now()