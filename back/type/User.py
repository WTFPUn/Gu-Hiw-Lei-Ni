from pydantic import BaseModel
from typing import Optional


# password is excluded from the model
class User(BaseModel):
    user_name: str
    password: Optional[bytes] = None
    first_name: str
    last_name: str
    user_id: str
