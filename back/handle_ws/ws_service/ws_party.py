import os
import jwt
from pub_sub import Channel
from handle_ws.client import Client
from handle_ws.ws_service import WebSocketService
from pydantic import BaseModel, Field
from typing import Literal, Union, Annotated
from type.party import Party
from type.client_cookie import ClientCookie
from uuid import uuid4


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
    party_id: str


PartyHandlerRequest = Annotated[
    Union[
        CreatePartyRequest,
        JoinPartyRequest,
        StartPartyRequest,
        ClosePartyRequest,
        GetCurrentParty,
    ],
    Field(discriminator="type"),
]


class PartyHandler(WebSocketService[PartyHandlerRequest]):
    """
    Match making service.
    """

    onSearchParty = {}

    async def handle_ws(self, request: PartyHandlerRequest, client: Client) -> None:
        """
        Handle websocket request.
        """
        if self.mongo_client is None:
            raise Exception("Mongo client is not set")

        if isinstance(request, CreatePartyRequest):
            partydata = request.party
            partydata.id = str(uuid4())
            partydata.members.append(partydata.host_id)
            self.mongo_client["GuHiw"]["Party"].insert_one(request.party.model_dump())
            channel: Channel = "party", str(request.party.id)
            self.pub_sub.register(channel, request.party)
            self.pub_sub.subscribe(channel, client)

        elif isinstance(request, JoinPartyRequest):
            channel = "party", request.party_id
            self.pub_sub.subscribe(channel, client)
            data = jwt.decode(
                client.token, os.getenv("JWT_SECRET"), algorithms=["HS256"]
            )
            data = ClientCookie.model_validate(data)
            user_id = data.user_id
            self.mongo_client["GuHiw"]["Party"].find_one_and_update(
                {"id": request.party_id}, {"$push": {"members": user_id}}
            )
            await client.callback.send_json(
                {"success": True, "message": "Successfully joined party"}
            )

        elif isinstance(request, StartPartyRequest):
            channel = "party", request.party_id
            current_party: Party = self.pub_sub.channel_message[channel]  # type: ignore
            data = jwt.decode(
                client.token, os.getenv("JWT_SECRET"), algorithms=["HS256"]
            )
            data = ClientCookie.model_validate(data)

            user_id = data.user_id
            if user_id != current_party.host_id:
                raise Exception("Only host can start party")

            current_party.status = "in_progress"
            await self.pub_sub.publish(channel, current_party)
            self.mongo_client["GuHiw"]["Party"].find_one_and_update(
                {"id": request.party_id}, {"$set": {"status": "in_progress"}}
            )
        elif isinstance(request, ClosePartyRequest):
            channel = "party", request.party_id
            current_party: Party = self.pub_sub.channel_message[channel]  # type: ignore
            data = jwt.decode(
                client.token, os.getenv("JWT_SECRET"), algorithms=["HS256"]
            )
            data = ClientCookie.model_validate(data)
            user_id = data.user_id
            if user_id != current_party.host_id:
                raise Exception("Only host can close party")
            self.pub_sub.unregister(channel)
            self.mongo_client["GuHiw"]["Party"].find_one_and_update(
                {"id": request.party_id}, {"$set": {"status": "finished"}}
            )

        # elif isinstance(request, GetCurrentParty):
        #     channel = "party", request.party_id
        #     current_party: Party = self.pub_sub.channel_message[channel]

        else:
            raise Exception("Unknown request type")
        # request =  self.RequestType.
