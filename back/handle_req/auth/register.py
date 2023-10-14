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
        collection = self.mongo_client["GuHiw"]["User"]     
        # Gen Salt + Hash Password
        hashed_password = bcrypt.hashpw(self.body.password.encode("ascii"), bcrypt.gensalt())
        # Hash Password
        # Check if username or email already exists
        if(collection.find_one({"email": self.body.email})):
            self.logger.info("400 Error")
            return Response("Email already exists", status_code=400)
        if(collection.find_one({"username": self.body.username})):
            self.logger.info("400 Error")
            return Response("Username already exists", status_code=400)
        hashedBody = self.body.model_dump()
        hashedBody["password"] = hashed_password
        try:            
            collection.insert_one(hashedBody)
        except Exception as e:
            self.logger.error(e)
            return Response("error", status_code=500)
        return Response("register")
