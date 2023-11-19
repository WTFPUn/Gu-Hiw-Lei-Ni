from pydantic import BaseModel


class ResponseWs(BaseModel):
    type: str
    data: BaseModel
