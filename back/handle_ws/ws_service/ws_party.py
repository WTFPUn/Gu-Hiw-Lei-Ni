from __future__ import annotations
import os
import jwt
import asyncio
from uuid import uuid4
from math import sqrt, pi, cos, asin
from pub_sub import Channel
from handle_ws.client import Client
from handle_ws.ws_service import WebSocketService
from pydantic import BaseModel, Field
from typing import Literal, Union, Annotated, Dict, List
import json

from type.party import Party
from type.client_cookie import ClientCookie
from type.ws.response_ws import ResponseWs


class CreatePartyRequest(BaseModel):
    type: Literal["create_party"] = "create_party"
    party: Party


class JoinPartyRequest(BaseModel):
    type: Literal["join_party"] = "join_party"
    party_id: str


class StartPartyRequest(BaseModel):
    type: Literal["start_party"] = "start_party"
    party_id: str


class ClosePartyRequest(BaseModel):
    type: Literal["close_party"] = "close_party"
    party_id: str


class GetCurrentParty(BaseModel):
    type: Literal["get_current_party"] = "get_current_party"


class SearchParty(BaseModel):
    type: Literal["search_party"] = "search_party"
    lat: float
    lng: float
    radius: int = 4


PartyHandlerRequest = Annotated[
    Union[
        CreatePartyRequest,
        JoinPartyRequest,
        StartPartyRequest,
        ClosePartyRequest,
        GetCurrentParty,
        SearchParty,
    ],
    Field(discriminator="type"),
]

class CurrentPartyResponse(ResponseWs):
  type: Literal["current_party"] = "current_party"
  data: UserPartyMessage
  
class PartyResponse(ResponseWs):
  type: Literal["party"] = "party"
  data: Party

class UserPartyMessage(BaseModel):
    party_id: str


class PartyPositionMessage(BaseModel):
    party_id: str
    lat: float
    lng: float


class ListPartyPositionMessage(BaseModel):
    list_party: Dict[str, PartyPositionMessage] = {}


class PartyHandler(WebSocketService[PartyHandlerRequest]):
    """
    Match making service.
    """

    onSearchParty = {}

    def __init__(self) -> None:
        super().__init__()

        list_party_channel: Channel = ("list_party",)
        self.pub_sub.register(
            list_party_channel,
            ResponseWs(type="list_party", data=ListPartyPositionMessage()),
        )

    def __recover_data(self):
        pass

    def __calculate_distance(
        self, p1_lat: float, p1_lng: float, p2_lat: float, p2_lng: float
    ) -> float:
        R = 6371
        dLat = ((p2_lat - p1_lat) * pi) / 180
        dLon = ((p2_lng - p1_lng) * pi) / 180
        a = (
            0.5
            - cos(dLat) / 2
            + (cos((p1_lat * pi) / 180) * cos((p2_lat * pi) / 180) * (1 - cos(dLon)))
            / 2
        )

        return R * 2 * asin(sqrt(a))

    async def handle_ws(self, request: PartyHandlerRequest, client: Client) -> bool:
        """
        Handle websocket request.
        """
        if self.mongo_client is None:
            raise Exception("Mongo client is not set")

        if isinstance(request, CreatePartyRequest):
            channel: Channel = "current_party", client.token_data.user_id
            if channel in self.pub_sub.subscribers:
                await client.callback.send_json(
                    {"success": False, "message": "User already in party"}
                )
                return True

            partydata = request.party
            partydata.id = str(uuid4())
            partydata.members.append(partydata.host_id)
            self.mongo_client["GuHiw"]["Party"].insert_one(request.party.model_dump())
            channel: Channel = "party", str(request.party.id)
            self.pub_sub.register(channel, PartyResponse(type="party", data=request.party))
            self.pub_sub.subscribe(channel, client)

            channel: Channel = "current_party", client.token_data.user_id
            self.pub_sub.register(
                channel,
                CurrentPartyResponse(
                    type="current_party", data=UserPartyMessage(party_id=partydata.id)
                ),
            )
            self.pub_sub.subscribe(channel, client)

            party_position = PartyPositionMessage(
                party_id=partydata.id, lat=partydata.lat, lng=partydata.lng
            )
            list_party_channel: Channel = ("list_party",)

            current_list_party: ListPartyPositionMessage = self.pub_sub.channel_message[list_party_channel].data  # type: ignore
            current_list_party.list_party[partydata.id] = party_position

            await self.pub_sub.publish(
                list_party_channel,
                ResponseWs(type="list_party", data=current_list_party),
            )
            await client.callback.send_json(
                {
                    "success": True,
                    "message": "Successfully created party",
                    "party_id": partydata.id,
                }
            )

            # Find placeID

        elif isinstance(request, JoinPartyRequest):
            channel = "party", request.party_id
            self.pub_sub.subscribe(channel, client)

            user_id = client.token_data.user_id
            access_status = self.mongo_client["GuHiw"]["Party"].find_one_and_update(
                {"id": request.party_id}, {"$push": {"members": user_id}}
            )

            if not access_status:
                await client.callback.send_json(
                    {"success": False, "message": "Party does not exist"}
                )

            else:
                channel: Channel = "current_party", client.token_data.user_id
                self.pub_sub.register(
                    channel,
                    ResponseWs(
                        type="current_party",
                        data=UserPartyMessage(party_id=request.party_id),
                    ),
                )
                self.pub_sub.subscribe(channel, client)

                await client.callback.send_json(
                    {"success": True, "message": "Successfully joined party"}
                )

        elif isinstance(request, StartPartyRequest):
            channel = "party", request.party_id
            current_party: Party = self.pub_sub.channel_message[channel].data  # type: ignore
            data = jwt.decode(
                client.token, os.getenv("JWT_SECRET"), algorithms=["HS256"]
            )
            data = ClientCookie.model_validate(data)

            user_id = data.user_id
            if user_id != current_party.host_id:
                raise Exception("Only host can start party")

            current_party.status = "in_progress"
            await self.pub_sub.publish(
                channel, ResponseWs(type="party", data=current_party)
            )
            self.mongo_client["GuHiw"]["Party"].find_one_and_update(
                {"id": request.party_id}, {"$set": {"status": "in_progress"}}
            )
        elif isinstance(request, ClosePartyRequest):
            channel = "party", request.party_id
            current_party: Party = self.pub_sub.channel_message[channel].data  # type: ignore
            user_id = client.token_data.user_id
            if user_id != current_party.host_id:
                raise Exception("Only host can close party")

            delete_party_member = current_party.members

            for member_id in delete_party_member:
                current_part_channel: Channel = "current_party", member_id
                self.pub_sub.unregister(current_part_channel)

            self.pub_sub.unregister(channel)
            access_status = self.mongo_client["GuHiw"]["Party"].find_one_and_update(
                {"id": request.party_id}, {"$set": {"status": "finished"}}
            )

            if access_status:
                await client.callback.send_json(
                    {
                        "success": False,
                        "message": f"Party does not exist or party({request.party_id}) is already closed",
                    }
                )
            else:
                await client.callback.send_json(
                    {"success": True, "message": "Successfully joined party"}
                )

        elif isinstance(request, GetCurrentParty):
            channel = "current_party", client.token_data.user_id
            if channel not in self.pub_sub.channel_message:
                await client.callback.send_json(
                    {"success": False, "message": "User is not currently in party"}
                )
                return True
            current_party: UserPartyMessage = self.pub_sub.channel_message[channel].data  # type: ignore
            current_party_id = current_party.party_id

            channel = "party", current_party_id
            response: ResponseWs = self.pub_sub.channel_message[channel]  # type: ignore
            dump = json.loads(response.model_dump_json())
            await client.callback.send_json(dump)
            return True

        elif isinstance(request, SearchParty):
            # set lat variable and set to 5 decimal point
            in_radius_party = self.search_party_in_radius(request)
            await client.callback.send_json({"parties": in_radius_party})

        else:
            # raise Exception("Unknown request type")
            return False
        # request =  self.RequestType.
        return True

    def search_party_in_radius(self, request: SearchParty) -> List[str]:
        lat = round(request.lat, 5)
        lng = round(request.lng, 5)

        items: List[str] = []

        list_party = self.pub_sub.channel_message[("list_party",)].data.list_party  # type: ignore

        if isinstance(list_party, ListPartyPositionMessage):
            for party_id, party_info in list_party.list_party.items():
                dist = self.__calculate_distance(
                    lat, lng, party_info.lat, party_info.lng
                )
                if dist < request.radius:
                    party: Party = self.pub_sub.get(("party", party_id))  # type: ignore
                    items.append(party.model_dump_json())

        return items
