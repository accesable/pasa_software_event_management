from pydantic import BaseModel
from datetime import datetime
from typing import List
class Activity(BaseModel):
    id: int
    name: str
    description: str = None
    speakers: List[int] = []