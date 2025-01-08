from typing import List
from domain.models.user import User
from domain.repositories.user_repo import UserRepository

class UserRepositoryImpl(UserRepository):
    async def get_users(self) -> List[User]:
        # Example implementation
        return [User(id=1, name="John Doe", email="john@example.com")]
