from pydantic import BaseModel


class User(BaseModel):
    user_name: str
    password: bytes
    first_name: str
    last_name: str
    user_id: str
