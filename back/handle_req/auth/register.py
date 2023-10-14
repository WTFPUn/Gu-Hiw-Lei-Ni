from typing import List
from handle_req import HandleRequest, methods
from starlette.requests import Request
from starlette.responses import Response
from logging import Logger
from pydantic import BaseModel, TypeAdapter, ValidationError


logger: Logger = Logger(__name__)
logger.setLevel(0)


class Register(HandleRequest):
    async def handle(self, request: Request) -> Response:
        logger.info("register")

        return Response("register")
