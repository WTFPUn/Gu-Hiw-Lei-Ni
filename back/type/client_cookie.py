from pydantic import BaseModel
from bson import ObjectId


class ClientCookie(BaseModel):
    _id: ObjectId
    user_id: str
    user_name: str
    first_name: str
    last_name: str
