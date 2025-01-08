from pydantic import BaseModel
from datetime import datetime

class Event(BaseModel):
    id: int
    name: str
    location: str
    capacity : int = 0
    category : str = "conference"
    start_date: datetime = datetime.now()
    end_date: datetime = None
    
