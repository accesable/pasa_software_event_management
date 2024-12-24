from fastapi import FastAPI
from infrastructure.database import initialize_database
from api.event_rating_api import router as event_rating_router
import uvicorn



if __name__ == "__main__":
    # Initialize the app
    app = FastAPI(title="Event Rating API", description="A RESTful API for Event Ratings", version="1.0.0")

    # Initialize the database
    initialize_database()

    # Include the router
    app.include_router(event_rating_router, prefix="/api/v1", tags=["Event Ratings"])
    uvicorn.run(app, host="127.0.0.1", port=8000)