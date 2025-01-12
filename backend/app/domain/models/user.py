from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str
    title : str
    is_temporary: bool
