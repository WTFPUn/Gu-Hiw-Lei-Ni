from __future__ import annotations

import os
import jwt
from typing import Any, Callable, Coroutine, List, Tuple, Set, ForwardRef
from starlette.websockets import WebSocket, WebSocketState
from pydantic import BaseModel
from typing import Dict, Union, Annotated, Literal, List
from type.client_cookie import ClientCookie


class SubscribeError(Exception):
    """
    Error when subscribe service to client.
    """

    pass


Channel = Tuple[str, ...]
serviceType = Tuple[ForwardRef("PubSub"), Channel]  # type: ignore


class Client:
    """
    Class to keep track of the client use service from websocket in multiplexer.
    """

    token: str
    callback: Callable[[dict], Coroutine[Any, Any, None]]
    subscribe_service: Set[serviceType]

    def __init__(self, token: str, callback: WebSocket) -> None:
        self.token = token
        self.subscribe_service = set()
        self.ws = callback
        self.callback = self.proxy_callback
        self.token_data: ClientCookie = self._decode_token()

    async def proxy_callback(self, dict: dict) -> None:
        """
        Proxy callback to client.
        """
        if self.ws.client_state == WebSocketState.CONNECTED:
            return await self.ws.send_json(dict)

    def _decode_token(self) -> ClientCookie:
        data = jwt.decode(self.token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        data = ClientCookie.model_validate(data)

        return data

    @staticmethod
    def decode_token(token) -> ClientCookie:
        data = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        data = ClientCookie.model_validate(data)

        return data

    def add_service(self, service: serviceType) -> bool:  # type: ignore
        """
        Add service to client.
        """
        if service in self.subscribe_service:
            return False
        self.subscribe_service.add(service)
        return True

    def remove_service(self, service: serviceType) -> bool:
        """
        Remove service from client.
        """
        if service not in self.subscribe_service:
            return False
        self.subscribe_service.remove(service)
        return True
