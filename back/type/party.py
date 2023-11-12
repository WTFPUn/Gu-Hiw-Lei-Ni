from pydantic import BaseModel
from type.chat import Chat
from typing import Literal, Optional
from datetime import datetime


class Party(BaseModel):
    id: Optional[str] = None
    size: int
    description: str
    host_id: str
    budget: Literal["low", "medium", "high"]
    lat: float
    lng: float
    place_id: str
    members: list[str] = []
    created_timestamp: datetime = datetime.now()
    status: Literal[
        "not_started", "in_progress", "finished", "cancelled"
    ] = "not_started"
    # chat: Chat
