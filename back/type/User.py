from pydantic import BaseModel


class User(BaseModel):
    user_name: str
    password: str
    first_name: str
    last_namme: str
    user_id: str
