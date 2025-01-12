from pydantic import BaseModel
from datetime import datetime

class EventDTO(BaseModel):
    name: str
    location: str
    capacity : int = 0
    category : str = "conference"
    description: str
    start_date: datetime = datetime.now()
    end_date: datetime = None