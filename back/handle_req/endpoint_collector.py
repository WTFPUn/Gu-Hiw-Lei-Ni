from starlette.routing import Route
from typing import List
from handle_req import HandleRequest


class EndpointCollector:
    def __init__(self, mongo_client) -> None:
        self.mongo_client = mongo_client
        self.handlings: List[HandleRequest] = []

    def __str__(self) -> str:
        return "/" + self.__class__.__name__.lower()

    def route(self) -> List[Route]:
        return [
            Route(self.__str__() + str(h), h.handle, methods=h.method)
            for h in self.handlings
        ]

    @staticmethod
    def load_handling(cls, handlings: List[HandleRequest]) -> None:
        cls.handlings = handlings
        return None

    def load_mongo_client(self, mongo_client) -> None:
        for h in self.handlings:
            h.load_mongo_client(mongo_client)
        return None

    def load_google_api_key(self, api_key: str) -> None:
        for h in self.handlings:
            h.load_google_api_key(api_key)
        return None
