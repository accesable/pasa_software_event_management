from typing import List
from domain.models.user import User
from domain.repositories.user_repo import UserRepository

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def list_users(self) -> List[User]:
        return await self.user_repo.get_users()
