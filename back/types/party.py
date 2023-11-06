from pydantic import BaseModel
from types.chat import Chat
from typing import Literal


class Party(BaseModel):
    id: str
    size: int
    description: str
    host_id: str
    budget: Literal["low", "medium", "high"]
    lat: float
    lng: float
    place_id: str
    members: list[str]
    created_timestamp: str
    status: Literal["not_started", "in_progress", "finished", "cancelled"]
    chat: Chat
