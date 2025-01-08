from fastapi import FastAPI
from api.v1.endpoints import user,event

app = FastAPI()

# Include API routes
app.include_router(user.router, prefix="/api/v1", tags=["users"])
app.include_router(event.router, prefix="/api/v1", tags=["events"])