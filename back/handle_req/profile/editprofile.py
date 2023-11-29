import os
import token
import jwt
import bcrypt
from pydantic import BaseModel
from starlette.responses import Response, JSONResponse
from handle_req import HandleRequest
from typing import Optional
class EditProfileRequest(BaseModel):
    user_id: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    # profile_picture: bytes
    confirm_password: Optional[str] = None


class EditProfileBody(BaseModel):
    data: EditProfileRequest
    token: str

class EditProfile(HandleRequest[EditProfileBody, None]):
    async def _handle(self) -> Response:        
        if self.mongo_client is None:
            raise Exception("Mongo client is not set")
        req = self.body.data.model_dump(exclude_none=True)
        user_data = jwt.decode(
            self.body.token, os.getenv("JWT_SECRET"), algorithms=["HS256"]
        )
        collection = self.mongo_client["GuHiw"]["User"]
        user = user_data.user_id.find_one({"user_id": req.user_id})
        if user:
            if bcrypt.checkpw(req.confirm_password.encode("ascii"), user["password"]):
                if req.first_name:
                    user["first_name"] = req.first_name
                if req.last_name:
                    user["last_name"] = req.last_name
                collection.update_one({"user_id": req.user_id}, {"$set": user})
                return JSONResponse({"status": True})
            else:
                return Response("Password is incorrect", status_code=401)
        else:
            return Response("User not found", status_code=404)