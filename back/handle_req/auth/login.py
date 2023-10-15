from typing import List
from handle_req import HandleRequest, methods
from starlette.requests import Request
from starlette.responses import Response
from logging import Logger
from pydantic import BaseModel, TypeAdapter, ValidationError
import bcrypt

class LoginRequestBody(BaseModel):
    user_name: str
    password: str


class Login(HandleRequest[LoginRequestBody, None]):
    async def _handle(self) -> Response:
        collection = self.mongo_client["GuHiw"]["User"]
        if collection.find_one({"user_name": self.body.user_name}):
            user = collection.find_one({"user_name": self.body.user_name})
            else:
                return Response("Username or password is incorrect", status_code=401)
        else:
            return Response("Username or password is incorrect", status_code=401)
        pass
