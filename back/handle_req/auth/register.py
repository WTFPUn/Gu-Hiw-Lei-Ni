from typing import List
from handle_req import HandleRequest, methods
from starlette.requests import Request
from starlette.responses import Response
from pydantic import BaseModel, TypeAdapter, ValidationError
import bcrypt
from uuid import uuid4


class RegisterRequestBody(BaseModel):
    user_name: str
    password: str
    confirm_password: str
    first_name: str
    last_name: str
    # image is a base64 encoded string
    # image: str


class Register(HandleRequest[RegisterRequestBody, None]):
    async def _handle(self) -> Response:
        self.logger.debug(self.body)
        collection = self.mongo_client["GuHiw"]["User"]
        # Gen Salt + Hash Password
        hashed_password = bcrypt.hashpw(
            self.body.password.encode("ascii"), bcrypt.gensalt()
        )
        if self.body.password != self.body.confirm_password:
            self.logger.info("400 Error")
            return Response("Passwords do not match", status_code=400)
        del self.body.confirm_password
        if collection.find_one({"user_name": self.body.user_name}):
            self.logger.info("400 Error")
            return Response("Username already exists", status_code=400)

        hashedBody = self.body.model_dump()
        hashedBody["password"] = hashed_password

        hashedBody["user_id"] = str(uuid4())

        try:
            collection.insert_one(hashedBody)
        except Exception as e:
            self.logger.error(e)
            return Response("error", status_code=500)
        # WIP: return token
        return Response("register")
