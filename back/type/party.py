from pydantic import BaseModel, Field
from type.chat import Chat
from type.User import User
from typing import Literal, Optional, Dict, ClassVar
from datetime import datetime
from uuid import uuid4

UserId = str


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
    members: list[User] = []
    created_timestamp: str = str(datetime.now())
    status: Literal[
        "not_started", "in_progress", "finished", "cancelled"
    ] = "not_started"


class ReferenceParty(Party):
    # excluude host_id
    host_id: ClassVar[None] = None
    host: User
    members: Dict[UserId, User] = {}
