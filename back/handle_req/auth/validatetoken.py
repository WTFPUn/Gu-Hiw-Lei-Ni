import os
import jwt
from pydantic import BaseModel
from starlette.responses import Response, JSONResponse


from type.client_cookie import ClientCookie
from handle_req import HandleRequest


class ValidateTokenRequest(BaseModel):
    token: str


class ValidateToken(HandleRequest[ValidateTokenRequest, None]):
    async def _handle(self) -> Response:
        data = jwt.decode(
            self.body.token, os.getenv("JWT_SECRET"), algorithms=["HS256"]
        )
        data = ClientCookie.model_validate(data)

        collection = self.mongo_client["GuHiw"]["User"]
        access_status = collection.find_one({"user_id": data.user_id})

        return JSONResponse({"status": True if access_status else False})
