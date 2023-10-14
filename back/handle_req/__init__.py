from abc import ABC, abstractmethod
from starlette.requests import Request
from starlette.responses import Response
from typing import List, Literal
from pymongo import MongoClient

methods = Literal["GET", "POST", "PUT", "DELETE"]


class HandleRequest(ABC):
    def __init__(self, method: List[methods]) -> None:
        self.method = method
        self.mongo_client: MongoClient = None

    @abstractmethod
    async def handle(self, request: Request) -> Response:
        pass

    def load_mongo_client(self, mongo_client: MongoClient) -> None:
        self.mongo_client = mongo_client
        return None

    def __str__(self) -> str:
        return "/" + self.__class__.__name__.lower()

    def __repr__(self) -> str:
        return self.__str__()
