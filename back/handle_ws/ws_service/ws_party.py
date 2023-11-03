from handle_ws.ws_service import WebSocketService
from pydantic import BaseModel, Field
from typing import Literal, Union, Annotated
from starlette.websockets import WebSocket


class Party(BaseModel):
    party_id: str
    party_name: str
    members: list[str]


class CreatePartyRequest(BaseModel):
    type: Literal["create_party"] = "create_party"
    party_name: str


class JoinPartyRequest(BaseModel):
    type: Literal["join_party"] = "join_party"
    party_id: str


class MatchMakingRequest(BaseModel):
    type: Literal["match_making"] = "match_making"
    party_id: str


PartyHandlerRequest = Annotated[
    Union[CreatePartyRequest, JoinPartyRequest, MatchMakingRequest],
    Field(discriminator="type"),
]


class PartyHandler(WebSocketService[PartyHandlerRequest]):
    """
    Match making service.
    """

    onSearchParty = {}

    async def handle_ws(
        self, request: PartyHandlerRequest, websocket: WebSocket
    ) -> None:
        """
        Handle websocket request.
        """
        self.pub_sub.register()
        # request =  self.RequestType.
        pass
