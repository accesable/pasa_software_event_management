from fastapi import APIRouter, Depends
from services.user_service import UserService
from infrastructure.repositories.user_repo import UserRepositoryImpl

router = APIRouter()

@router.get("/users")
async def get_users():
    user_service = UserService(UserRepositoryImpl())
    return await user_service.list_users()
