from typing import List
from handle_req import HandleRequest, methods
from starlette.requests import Request
from starlette.responses import Response
from logging import Logger
from pydantic import BaseModel, TypeAdapter, ValidationError


class LoginRequestBody(BaseModel):
    username: str
    password: str


class Login(HandleRequest[LoginRequestBody, None]):
    async def _handle(self) -> Response:
        pass
