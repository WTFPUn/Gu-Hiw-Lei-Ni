from abc import ABC, abstractmethod
from starlette.requests import Request
from starlette.responses import Response
from typing import List, Literal, Dict, Generic, TypeVar
from pymongo import MongoClient
from logging import Logger
import logging
from pydantic import BaseModel, TypeAdapter, ValidationError

logging.basicConfig(level=logging.NOTSET)

# set logger format
logger: Logger = Logger(__name__)
methods = Literal["GET", "POST", "PUT", "DELETE"]

GenericRequestBody = TypeVar("GenericRequestBody", bound=BaseModel)
GenericRequestQParam = TypeVar("GenericRequestQParam", bound=BaseModel)


class HandleRequest(Generic[GenericRequestBody, GenericRequestQParam], ABC):
    body: GenericRequestBody
    query: GenericRequestQParam

    def __init__(
        self,
        method: List[methods],
        RequestBody: BaseModel | None = None,
        RequestQParam: BaseModel | None = None,
    ) -> None:
        self.logger: Logger = logger.getChild(self.__class__.__name__)
        self.method = method
        self.mongo_client: MongoClient
        self.RequestBody = RequestBody
        self.RequesstQParam = RequestQParam

    async def handle(self, request: Request) -> Response:
        if self.mongo_client == None:
            self.logger.error("Mongo Client not loaded")
            return Response("Mongo couldn't be loaded", status_code=500)
        if request.method not in self.method:
            return Response("Method not allowed", status_code=405)
        try:
            if self.RequestBody != None:
                if request.method in ["POST", "PUT"]:
                    body = await request.json()
                    self.logger.debug(body)
                    self.body = self.RequestBody.model_validate(body)  # type: ignore

            if self.RequesstQParam != None:
                if "GET" == request.method:
                    self.query = self.RequesstQParam.model_validate(request.query_params)  # type: ignore

            return await self._handle()
        except Exception as e:
            self.logger.error(e)
            return Response("Bad Request", status_code=400)

    @abstractmethod
    async def _handle(
        self,
    ) -> Response:
        pass

    def load_mongo_client(self, mongo_client: MongoClient) -> None:
        self.mongo_client = mongo_client
        return None

    def load_google_api_key(self, api_key: str) -> None:
        self.api_key = api_key
        return None

    def __str__(self) -> str:
        return "/" + self.__class__.__name__.lower()

    def __repr__(self) -> str:
        return self.__str__()
