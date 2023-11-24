from pydantic import BaseModel, Field
from type.chat import Chat
from type.User import User
from typing import Literal, Optional, TypedDict, ClassVar
from datetime import datetime


class TypedDictParty(TypedDict):
    id: Optional[str]
    size: int
    description: str
    host_id: str
    budget: Literal["low", "medium", "high"]
    lat: float
    lng: float
    place_id: Optional[str]
    location: Optional[str]
    members: list[str]
    created_timestamp: datetime
    status: Literal["not_started", "in_progress", "finished", "cancelled"]
    chat: Optional[Chat]


class Party(BaseModel):
    id: str = str(uuid4())
    party_name: str
    size: int
    description: str
    host_id: str
    budget: Literal["low", "medium", "high"]
    lat: float
    lng: float
    place_id: Optional[str] = None
    location: Optional[str] = None
    members: list[str] = []
    created_timestamp: datetime = datetime.now()
    status: Literal[
        "not_started", "in_progress", "finished", "cancelled"
    ] = "not_started"
    chat: Optional[Chat] = None


class ReferenceParty(Party):
    # excluude host_id
    host_id: ClassVar[None] = None
    host: User
    members: list[User]

    def check_member_exist(self, user_id: str) -> bool:
        for member in self.members:
            if member.user_id == user_id:
                return True
        return False
