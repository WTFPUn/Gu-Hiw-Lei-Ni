from pydantic import BaseModel, Field
from datetime import datetime
from typing import Union, Literal, List, ClassVar
from uuid import uuid4

# import objectid


time_stamp = ClassVar[datetime]


class Message(BaseModel):
    type: str
    message_id: str = str(uuid4())
    message: str
    timestamp: str = str(datetime.now())


class UserChatMessage(Message):
    type: Literal["user_chat_message"] = "user_chat_message"
    user_id: str


class SystemMessage(Message):
    type: Literal["system_message"] = "system_message"
    message: str


class JoinMessage(SystemMessage):
    def __init__(self, user_name: str) -> None:
        super().__init__(message=f"{user_name} has joined the chat.")


class LeaveMessage(SystemMessage):
    def __init__(self, user_name: str) -> None:
        super().__init__(message=f"{user_name} has left the chat.")


ChatMessage = Union[UserChatMessage, SystemMessage]


class Chat(BaseModel):
    session_id: str
    dialogues: List[ChatMessage]
    status: Literal["open", "closed"] = "open"
