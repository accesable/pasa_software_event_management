from pydantic import BaseModel
from datetime import datetime

class Speaker(BaseModel):
    id: int
    name: str
    title: str