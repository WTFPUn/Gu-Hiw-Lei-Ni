from typing import Callable, List

from handle_ws.ws_service import WebSocketService
from starlette.websockets import WebSocket


class SubscribeError(Exception):
    """
    Error when subscribe service to client.
    """

    pass


class Client:
    """
    Class to keep track of the client use service from websocket in multiplexer.
    """

    token: str
    callback: WebSocket
    subscribe_service: List[WebSocketService]

    def __init__(self, token: str) -> None:
        self.token = token
        self.subscribe_service = []

    def add_service(self, service: WebSocketService) -> bool:
        """
        Add service to client.
        """
        if service in self.subscribe_service:
            raise SubscribeError("Service already subscribe to client.")
        self.subscribe_service.append(service)
        return True

    def remove_service(self, service: WebSocketService) -> bool:
        """
        Remove service from client.
        """
        if service not in self.subscribe_service:
            raise SubscribeError("Service not subscribe to client.")
        self.subscribe_service.remove(service)
        return True
