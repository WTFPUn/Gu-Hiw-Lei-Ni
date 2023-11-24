from __future__ import annotations

from typing import TypeVar, Generic, final, Dict
from handle_ws.client import Client
from pub_sub import PubSub
from abc import ABC, abstractmethod
from pydantic import BaseModel
from pymongo import MongoClient

WsRequest = TypeVar("WsRequest", bound=BaseModel)


class WebSocketService(ABC, Generic[WsRequest]):
    """
    Abstract class for websocket service.
    """

    def __new__(cls):
        cls.pub_sub = PubSub()
        cls.mongo_client: MongoClient = None
        cls.RequestType: WsRequest
        return super().__new__(cls)

    def set_mongo_client(self, mongo_client) -> None:
        self.mongo_client = mongo_client

    @abstractmethod
    async def handle_ws(
        self, request: WsRequest, client: Client, service: Dict[str, WebSocketService]
    ) -> bool:
        """
        Handle websocket request.
        """
        pass

    def __str__(self) -> str:
        return self.__class__.__name__

    # @abstractmethod
    # async def __recover_data(self):
    #     pass
