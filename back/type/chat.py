from pydantic import BaseModel, Field
from datetime import datetime
from typing import Union, Literal, List, ClassVar, Optional
from uuid import uuid4

# import objectid


time_stamp = ClassVar[datetime]


class Message(BaseModel):
    type: str
    message_id: str = Field(default_factory=lambda: str(uuid4()))
    message: str
    timestamp: str = Field(default_factory=lambda: str(datetime.now()))


class UserChatMessage(Message):
    type: Literal["user_chat_message"] = "user_chat_message"
    user_id: str
    user_name: Optional[str] = None
    user_first_name: Optional[str] = None
    user_last_name: Optional[str] = None


class SystemMessage(Message):
    type: Literal["system_message"] = "system_message"
    message: str


class JoinMessage(SystemMessage):
    def __init__(self, first_name: str, last_name: str) -> None:
        super().__init__(message=f"{first_name} {last_name} has joined the chat.")


class LeaveMessage(SystemMessage):
    def __init__(self, first_name: str, last_name: str) -> None:
        super().__init__(message=f"{first_name} {last_name} has left the chat.")


ChatMessage = Union[UserChatMessage, SystemMessage]


class Chat(BaseModel):
    session_id: str
    dialogues: List[ChatMessage]
    status: Literal["open", "closed"] = "open"
