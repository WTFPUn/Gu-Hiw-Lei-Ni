from __future__ import annotations
from uuid import uuid4
from math import sqrt, pi, cos, asin
from algorithm.MST import ClusterResponse, MSTClustering
from pub_sub import Channel
from handle_ws.client import Client
from handle_ws.ws_service import WebSocketService
from pydantic import BaseModel, Field
from typing import Literal, Optional, Set, TypedDict, Union, Annotated, Dict, List
import json

from type.User import User
from type.party import Party, ReferenceParty
from type.ws.response_ws import ResponseWs
import os


from .ws_chat import (
    ChatHandler,
    CreateChatRequest,
    CloseChatRequest,
    JoinChatRequest,
    LeaveChatRequest,
)


class CreatePartyRequest(BaseModel):
    type: Literal["create_party"] = "create_party"
    party: Party


class JoinPartyRequest(BaseModel):
    type: Literal["join_party"] = "join_party"
    party_id: str


class StartPartyRequest(BaseModel):
    type: Literal["start_party"] = "start_party"
    party_id: str


class LeavePartyRequest(BaseModel):
    type: Literal["leave_party"] = "leave_party"
    party_id: str


class ClosePartyRequest(BaseModel):
    type: Literal["close_party"] = "close_party"
    party_id: str


class MatchMakingRequest(BaseModel):
    type: Literal["match_making"] = "match_making"
    radius: int
    budget: int
    lat: float
    lng: float


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
        LeavePartyRequest,
        MatchMakingRequest,
    ],
    Field(discriminator="type"),
]


class CurrentPartyResponse(ResponseWs):
    type: Literal["current_party"] = "current_party"
    data: UserPartyMessage


class PartyResponse(ResponseWs):
    type: Literal["party"] = "party"
    data: ReferenceParty


class ListPartyResponse(ResponseWs):
    type: Literal["list_party"] = "list_party"
    data: ListPartyPositionMessage


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

    STACKED_RADIUS_RATIO = int(os.getenv("STACKED_RADIUS_RATIO", 5))

    onSearchParty = {}

    def __init__(self) -> None:
        super().__init__()

        list_party_channel: Channel = ("list_party",)
        self.pub_sub.register(
            list_party_channel,
            ListPartyResponse(type="list_party", data=ListPartyPositionMessage()),
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

    async def handle_ws(
        self,
        request: PartyHandlerRequest,
        client: Client,
        service: Dict[str, WebSocketService],
    ) -> bool:
        """
        Handle websocket request.
        """
        if self.mongo_client is None:
            raise Exception("Mongo client is not set")
        if isinstance(request, CreatePartyRequest):
            channel: Channel = "current_party", client.token_data.user_id
            if channel in self.pub_sub.subscribers:
                await client.callback(
                    {"success": False, "message": "User already in party"}
                )
                return True

            partydata = request.party
            party_host = self.mongo_client["GuHiw"]["User"].find_one(
                {"user_id": partydata.host_id},
                {"_id": False},
            )
            if party_host is None:
                await client.callback({"success": False, "message": "Host not found"})
                return True

            party_host = User.model_validate(party_host)
            party_host.__dict__.pop("password")

            copy_party = partydata.model_copy()
            dumpb_copy_party = copy_party.model_dump(exclude={"members", "host_id"})
            ref_party = ReferenceParty(
                **dumpb_copy_party,
                host=party_host,
                members={client.token_data.user_id: party_host},
            )
            partydata.members.append(party_host)
            self.mongo_client["GuHiw"]["Party"].insert_one(request.party.model_dump())
            channel: Channel = "party", str(request.party.id)
            self.pub_sub.register(channel, PartyResponse(type="party", data=ref_party))
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
                ListPartyResponse(type="list_party", data=current_list_party),
            )

            await service["chathandler"].handle_ws(
                CreateChatRequest(type="create_chat", session_id=partydata.id),
                client,
                service,
            )

            await client.callback(
                {
                    "success": True,
                    "message": "Successfully created party",
                    "party_id": partydata.id,
                }
            )

        elif isinstance(request, JoinPartyRequest):
            channel = "party", request.party_id
            party: PartyResponse = self.pub_sub.channel_message[channel]  # type: ignore
            size = party.data.size  # type: ignore
            if size <= len(party.data.members):  # type: ignore
                await client.callback({"success": False, "message": "Party is full"})
                return True
            self.pub_sub.subscribe(channel, client)
            user_id = client.token_data.user_id

            user = self.mongo_client["GuHiw"]["User"].find_one({"user_id": user_id})
            if user is None:
                await client.callback({"success": False, "message": "User not found"})
                return True

            user = User.model_validate(user)
            user.__dict__.pop("password")

            copy_party = party.data.model_copy()  # type: ignore
            dumpb_copy_party = copy_party.model_dump(exclude={"members", "host_id"})

            party.data.members[user_id] = user  # type: ignore

            await service["chathandler"].handle_ws(
                JoinChatRequest(type="join_chat", session_id=request.party_id),
                client,
                service,
            )

            await self.pub_sub.publish(channel, party)
            access_status = self.mongo_client["GuHiw"]["Party"].find_one_and_update(
                {"id": request.party_id}, {"$push": {"members": user_id}}
            )

            if not access_status:
                await client.callback(
                    {"success": False, "message": "Party does not exist"}
                )

            else:
                channel: Channel = "current_party", client.token_data.user_id
                self.pub_sub.register(
                    channel,
                    CurrentPartyResponse(
                        type="current_party",
                        data=UserPartyMessage(party_id=request.party_id),
                    ),
                )
                self.pub_sub.subscribe(channel, client)

                await client.callback(
                    {"success": True, "message": "Successfully joined party"}
                )

        elif isinstance(request, StartPartyRequest):
            channel = "party", request.party_id
            current_party: ReferenceParty = self.pub_sub.channel_message[channel].data  # type: ignore

            data = client.token_data

            user_id = data.user_id
            if current_party.host.user_id != user_id:  # type: ignore
                raise Exception("Only host can start party")

            current_party.status = "in_progress"

            self.mongo_client["GuHiw"]["Party"].find_one_and_update(
                {"id": request.party_id}, {"$set": {"status": "in_progress"}}
            )

            await self.pub_sub.publish(
                channel, PartyResponse(type="party", data=current_party)  # type: ignore
            )

            channel = "party", request.party_id
            current_party: Party = self.pub_sub.get(channel).data  # type: ignore

            await client.callback(
                {"success": True, "message": "Successfully start party"}
            )

        elif isinstance(request, LeavePartyRequest):
            channel = "party", request.party_id
            current_party: Party = self.pub_sub.get(channel).data  # type: ignore

            if current_party.status == "in_progress":  # type: ignore
                await client.callback(
                    {"success": False, "message": "Party is already started"}
                )
                return True

            user_id = client.token_data.user_id
            if user_id == current_party.host_id:  # type: ignore
                await client.callback(
                    {"success": False, "message": "Host cannot leave party"}
                )
                return True

            # remove user from chats
            chat_handle_result = await service["chathandler"].handle_ws(
                LeaveChatRequest(type="leave_chat", session_id=request.party_id),
                client,
                service,
            )

            if not chat_handle_result:
                await client.callback(
                    {"success": False, "message": "Chat does not exist"}
                )
                return True

            # remove user from party
            current_party.members.pop(user_id)  # type: ignore
            update_result = self.mongo_client["GuHiw"]["Party"].find_one_and_update(
                {"id": request.party_id}, {"$pull": {"members": user_id}}
            )

            if update_result is None:
                await client.callback(
                    {"success": False, "message": "Party does not exist"}
                )
                return True

            await client.callback(
                {"success": True, "message": "Successfully leave party"}
            )

            channel = "current_party", user_id
            self.pub_sub.unregister(channel)

        elif isinstance(request, ClosePartyRequest):
            channel = "party", request.party_id
            current_party: Party = self.pub_sub.channel_message[channel].data  # type: ignore
            user_id = client.token_data.user_id

            if current_party.host.user_id != user_id:  # type: ignore
                raise Exception("Only host can close party")

            close_chat_status = await service["chathandler"].handle_ws(
                CloseChatRequest(type="close_chat", session_id=request.party_id),
                client,
                service,
            )

            if not close_chat_status:
                await client.callback(
                    {
                        "success": False,
                        "message": "Chat does not exist or chat is already closed",
                    }
                )
                return True

            delete_party_member = current_party.members  # type: ignore

            for member_id in delete_party_member:
                current_part_channel: Channel = "current_party", member_id
                self.pub_sub.unregister(current_part_channel)

            channel = "party", request.party_id
            current_party: Party = self.pub_sub.get(channel).data  # type: ignore

            current_party.status = "finished"

            await self.pub_sub.publish(
                channel, PartyResponse(type="party", data=current_party)  # type: ignore
            )

            self.pub_sub.unregister(channel)
            access_status = self.mongo_client["GuHiw"]["Party"].find_one_and_update(
                {"id": request.party_id}, {"$set": {"status": "finished"}}
            )

            if not access_status:
                await client.callback(
                    {
                        "success": False,
                        "message": f"Party does not exist or party({request.party_id}) is already closed",
                    }
                )
            else:
                await client.callback(
                    {"success": True, "message": "Successfully close party"}
                )

        elif isinstance(request, GetCurrentParty):
            channel = "current_party", client.token_data.user_id
            if channel not in self.pub_sub.channel_message:
                await client.callback(
                    {"success": False, "message": "User is not currently in party"}
                )
                return True
            current_party: UserPartyMessage = self.pub_sub.channel_message[channel].data  # type: ignore
            current_party_id = current_party.party_id

            channel = "party", current_party_id
            response: PartyResponse = self.pub_sub.channel_message[channel]  # type: ignore
            dump = json.loads(response.model_dump_json())
            await client.callback(dump)
            return True

        elif isinstance(request, SearchParty):
            # set lat variable and set to 5 decimal point
            in_radius_party = self.search_party_in_radius(request)
            await client.callback({"cluster": in_radius_party.model_dump()})
            return True

        elif isinstance(request, MatchMakingRequest):
            radius = request.radius
            budget = request.budget
            lat = request.lat
            lng = request.lng

            parties_list = self.pub_sub.channel_message[("list_party",)].data.list_party  # type: ignore

            if isinstance(parties_list, ListPartyPositionMessage):
                parties_list = parties_list.list_party

                radius_filter: Set[ReferenceParty] = set()
                budget_filter: Set[ReferenceParty] = set()

                for party_id, party_info in parties_list.items():
                    party: ReferenceParty = self.pub_sub.get(("party", party_id)).data  # type: ignore
                    if party.get_distance_from_point(lat, lng) < radius:
                        radius_filter.add(party)
                    if party.budget == budget:
                        budget_filter.add(party)

                parties = radius_filter.intersection(budget_filter)

                if len(parties) == 0:
                    await client.callback(
                        {"success": False, "message": "No party found"}
                    )
                    return True

                party = list(parties)[0]

                # join party
                channel = "party", party.id
                await self.handle_ws(
                    JoinPartyRequest(type="join_party", party_id=party.id),
                    client,
                    service,
                )

                await client.callback(
                    {
                        "success": True,
                        "message": "Successfully found party",
                        "party": party.model_dump(),
                    }
                )

        else:
            return False
        # request =  self.RequestType.
        return True

    def search_party_in_radius(self, request: SearchParty) -> ClusterResponse:
        lat = round(request.lat, 5)
        lng = round(request.lng, 5)

        parties_in_radius: List[Party] = []

        list_party = self.pub_sub.channel_message[("list_party",)].data  # type: ignore

        if isinstance(list_party, ListPartyPositionMessage):
            for party_id, party_info in list_party.list_party.items():
                dist = self.__calculate_distance(
                    lat, lng, party_info.lat, party_info.lng
                )
                if dist < request.radius:
                    party: Party = self.pub_sub.get(("party", party_id))  # type: ignore
                    parties_in_radius.append(party.data)  # type: ignore

        mst = MSTClustering(parties_in_radius)

        mst.fit(K=request.radius / self.STACKED_RADIUS_RATIO)

        clus_res = mst.get_cluster_response()

        return clus_res
