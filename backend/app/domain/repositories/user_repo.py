from abc import ABC, abstractmethod
from typing import List
from domain.models.user import User

class UserRepository(ABC):
    @abstractmethod
    async def get_users(self) -> List[User]:
        pass
