from typing import TypeVar, Generic
from pub_sub import PubSub
from abc import ABC, abstractmethod
from pydantic import BaseModel
from starlette.websockets import WebSocket

WsRequest = TypeVar("WsRequest", bound=BaseModel)


class WebSocketService(ABC, Generic[WsRequest]):
    """
    Abstract class for websocket service.
    """

    pub_sub: PubSub = PubSub()

    @abstractmethod
    async def handle_ws(self, request: WsRequest, websocket: WebSocket) -> None:
        """
        Handle websocket request.
        """
        pass
