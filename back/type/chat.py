from pydantic import BaseModel


class ChatMessage(BaseModel):
    message_id: str
    message: str
    sender: str
    timestamp: str


class Chat(BaseModel):
    session_id: str
    dialogues: list[ChatMessage]
