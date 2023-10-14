from typing import List
from handle_req import HandleRequest, methods
from starlette.requests import Request
from starlette.responses import Response
from pydantic import BaseModel, TypeAdapter, ValidationError
import bcrypt


class RegisterRequestBody(BaseModel):
    username: str
    password: str
    email: str


class Register(HandleRequest[RegisterRequestBody, None]):
    async def _handle(self) -> Response:
        self.logger.debug(self.body)
        return Response("register")
