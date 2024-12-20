from typing import Union
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import uuid4

app = FastAPI()
# Define the request body model
class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str

# Define the response body model
class User(BaseModel):
    id: str
    email: EmailStr
    name: str
    avatar: str
    isActive: bool
    role: str
    createdAt: datetime
    updatedAt: datetime

class CreateUserResponse(BaseModel):
    statusCode: int
    message: str
    data: dict


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.post("/users", tags=["Users"], response_model=CreateUserResponse)
def login_user(user_request: CreateUserRequest):
    # Check if the email already exists
    if("abc123112@gmail.com" != user_request.email):
        raise HTTPException(status_code=400, detail="Invalid email address")

    # Create the user object
    user = {
        "id": str(uuid4()),  # Generate a unique ID
        "email": "abc123112@gmail.com",
        "name": "Nguyen Van A",  # Default name for demonstration
        "avatar": "https://res.cloudinary.com/dbvyexitw/image/upload/v1733847490/default%20avatar.jpg",
        "isActive": True,
        "role": "student",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    # Add to the "database"
    # users_db.append(user)

    # Construct the response
    response = {
        "statusCode": 201,
        "message": "User created successfully",
        "data": {
            "user": user
        }
    }

    return response