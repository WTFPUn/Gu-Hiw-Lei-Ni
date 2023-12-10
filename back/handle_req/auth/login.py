from typing import List
from handle_req import HandleRequest, methods
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from logging import Logger
from pydantic import BaseModel, TypeAdapter, ValidationError
import bcrypt
import jwt
import os


class LoginRequestBody(BaseModel):
    user_name: str
    password: str


class Login(HandleRequest[LoginRequestBody, None]):
    async def _handle(self) -> Response:
        collection = self.mongo_client["GuHiw"]["User"]
        user = collection.find_one({"user_name": self.body.user_name})
        if user:
            if bcrypt.checkpw(self.body.password.encode("ascii"), user["password"]):
                data = {
                    "user_id": user["user_id"],
                    "user_name": user["user_name"],
                    "first_name": user["first_name"],
                    "last_name": user["last_name"],
                }
                token = jwt.encode(data, os.getenv("JWT_SECRET"), algorithm="HS256")
                return JSONResponse({"token": token})
            else:
                return Response("Username or password is incorrect", status_code=401)
        else:
            return Response("Username or password is incorrect", status_code=401)
