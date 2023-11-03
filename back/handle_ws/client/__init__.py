from typing import Callable, List, Tuple, Set
from handle_ws.ws_service import WebSocketService
from starlette.websockets import WebSocket
from pydantic import BaseModel
from typing import Dict, Union, Annotated, Literal, List
from pub_sub import Channel, PubSub


class SubscribeError(Exception):
    """
    Error when subscribe service to client.
    """

    pass


channel = Tuple[str, ...]
serviceType = Tuple[PubSub, channel]


class Client:
    """
    Class to keep track of the client use service from websocket in multiplexer.
    """

    token: str
    callback: WebSocket
    subscribe_service: Set[serviceType]

    def __init__(self, token: str, callback: WebSocket) -> None:
        self.token = token
        self.subscribe_service = set()
        self.callback = callback

    def add_service(self, service: PubSub, channel: Channel) -> bool:
        """
        Add service to client.
        """
        if service in self.subscribe_service:
            raise SubscribeError("Service already subscribe to client.")
        self.subscribe_service.add((service, channel))
        return True

    def remove_service(self, service: PubSub, channel: Channel) -> bool:
        """
        Remove service from client.
        """
        if service not in self.subscribe_service:
            raise SubscribeError("Service not subscribe to client.")
        self.subscribe_service.remove((service, channel))
        return True
