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
    id: str = Field(default_factory=lambda: str(uuid4()))
    party_name: str
    size: int
    description: str
    host_id: str
    budget: Literal["low", "medium", "high"]
    lat: float
    lng: float
    place_id: Optional[str] = None
    location: Optional[str] = None
    members: list[User] | Dict[UserId, User] = []
    created_timestamp: str = Field(default_factory=lambda: str(datetime.now()))
    status: Literal[
        "not_started", "in_progress", "finished", "cancelled"
    ] = "not_started"

    @classmethod
    def lat_lng_to_radians(cls, lat: float, lng: float) -> tuple[float, float]:
        return math.radians(lat), math.radians(lng)

    @classmethod
    def get_distance(cls, party1: Party, party2: Party) -> float:
        """
        Get distance between two parties
        :param party1: party 1
        :param party2: party 2
        :return: distance
        """
        R = 6371  # Earth's radius in kilometers

        lat1, lng1 = cls.lat_lng_to_radians(party1.lat, party1.lng)
        lat2, lng2 = cls.lat_lng_to_radians(party2.lat, party2.lng)

        delta_lat = lat2 - lat1
        delta_lng = lng2 - lng1

        a = math.sin(delta_lat / 2) * math.sin(delta_lat / 2) + math.cos(
            lat1
        ) * math.cos(lat2) * math.sin(delta_lng / 2) * math.sin(delta_lng / 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c

    def get_distance_from_point(self, lat: float, lng: float) -> float:
        """
        Get distance from point
        :param lat: latitude
        :param lng: longitude
        :return: distance
        """
        R = 6371
        lat1, lng1 = self.lat_lng_to_radians(self.lat, self.lng)
        lat2, lng2 = self.lat_lng_to_radians(lat, lng)

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
