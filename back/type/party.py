from __future__ import annotations

from pydantic import BaseModel, Field
from type.chat import Chat
from type.User import User
from typing import Literal, Optional, Dict, ClassVar
from datetime import datetime
from uuid import uuid4
import math

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

    @classmethod
    def get_distance(cls, party1: Party, party2: Party) -> float:
        """
        Get distance between two parties
        :param party1: party 1
        :param party2: party 2
        :return: distance
        """
        R = 6371  # Earth's radius in kilometers

        lat1 = math.radians(party1.lat)
        lng1 = math.radians(party1.lng)
        lat2 = math.radians(party2.lat)
        lng2 = math.radians(party2.lng)

        delta_lat = lat2 - lat1
        delta_lng = lng2 - lng1

        a = math.sin(delta_lat / 2) * math.sin(delta_lat / 2) + math.cos(
            lat1
        ) * math.cos(lat2) * math.sin(delta_lng / 2) * math.sin(delta_lng / 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c


class ReferenceParty(Party):
    # excluude host_id
    host_id: ClassVar[None] = None
    host: User
    members: Dict[UserId, User] = {}
