from pydantic import BaseModel
from type.chat import Chat
from typing import Literal, Optional
from datetime import datetime


class Party(BaseModel):
    id: Optional[str] = None
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
