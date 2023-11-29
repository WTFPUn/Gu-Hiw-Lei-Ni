import os
import token
import jwt
import bcrypt
from pydantic import BaseModel
from starlette.responses import Response, JSONResponse
from handle_req import HandleRequest
from typing import Optional
from type.User import User


class EditProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    # profile_picture: bytes
    confirm_password: str


class EditProfileBody(BaseModel):
    data: EditProfileRequest
    token: str


class EditProfile(HandleRequest[EditProfileBody, None]):
    async def _handle(self) -> Response:
        if self.mongo_client is None:
            raise Exception("Mongo client is not set")
        req = self.body.data.model_dump()
        user_data = jwt.decode(
            self.body.token, os.getenv("JWT_SECRET"), algorithms=["HS256"]
        )
        collection = self.mongo_client["GuHiw"]["User"]
        user = collection.find_one({"user_id": user_data["user_id"]})

        user_val = User.model_validate(user)

        if user and user_val.password:
            if bcrypt.checkpw(
                req["confirm_password"].encode("ascii"), user_val.password
            ):
                if req["first_name"]:
                    user_val.first_name = req["first_name"]
                if req["last_name"]:
                    user_val.last_name = req["last_name"]

                collection.update_one(
                    {"user_id": user_val.user_id}, {"$set": user_val.model_dump()}
                )
                return JSONResponse({"status": True})
            else:
                return Response("Password is incorrect", status_code=401)
        else:
            return Response("User not found", status_code=404)
