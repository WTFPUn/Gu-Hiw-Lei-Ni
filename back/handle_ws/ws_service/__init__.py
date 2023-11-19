from typing import TypeVar, Generic
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

    RequestType: WsRequest

    def __init__(self) -> None:
        self.pub_sub: PubSub = PubSub()
        self.mongo_client: MongoClient | None = None

    def set_mongo_client(self, mongo_client) -> None:
        self.mongo_client = mongo_client

    @abstractmethod
    async def handle_ws(self, request: WsRequest, client: Client) -> bool:
        """
        Handle websocket request.
        """
        pass

    def __str__(self) -> str:
        return self.__class__.__name__

    @abstractmethod
    async def __recover_data(self):
        pass
