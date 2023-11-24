from __future__ import annotations
from ast import dump
import os
import jwt
import asyncio
from uuid import uuid4
from math import sqrt, pi, cos, asin
from pub_sub import Channel
from handle_ws.client import Client
from handle_ws.ws_service import WebSocketService
from pydantic import BaseModel, Field
from typing import Literal, Union, Annotated, Tuple, Dict, List
import json
from type.ws.response_ws import ResponseWs

from type.User import User
from type.party import Party, ReferenceParty
from type.client_cookie import ClientCookie
from type.ws.response_ws import ResponseWs
from type.chat import Chat, UserChatMessage, LeaveMessage, JoinMessage


class CreateChatRequest(BaseModel):
    type: Literal["create_chat"] = "create_chat"
    session_id: str


class JoinChatRequest(BaseModel):
    type: Literal["join_chat"] = "join_chat"
    session_id: str


class LeaveChatRequest(BaseModel):
    type: Literal["leave_chat"] = "leave_chat"
    session_id: str


class SendMessageRequest(BaseModel):
    type: Literal["send_message"] = "send_message"
    session_id: str
    message: UserChatMessage


class CloseChatRequest(BaseModel):
    type: Literal["close_chat"] = "close_chat"
    session_id: str


class ChatResponse(ResponseWs):
    type: Literal["chat"] = "chat"
    data: Chat


ChatHandleRequest = Annotated[
    Union[
        CreateChatRequest,
        JoinChatRequest,
        LeaveChatRequest,
        SendMessageRequest,
        CloseChatRequest,
    ],
    Field(discriminator="type"),
]
party_id = str
SessionPartyChannel = Tuple[Literal["session"], party_id]


class ChatHandler(WebSocketService[ChatHandleRequest]):
    def __recover_data(self):
        pass

    async def __validate_db(
        self, client: Client, mongo_result, error_message: str
    ) -> bool:
        """
        validate mongo result, if it is None, send error message to client and return True
        """
        if mongo_result is None:
            await client.callback.send_json({"type": "error", "error": error_message})
            return True

        return False

    async def handle_ws(
        self,
        request: ChatHandleRequest,
        client: Client,
        service: Dict[str, WebSocketService],
    ) -> bool:
        if self.mongo_client is None:
            raise Exception("Mongo client is not set")

        if isinstance(request, CreateChatRequest):
            session_id = request.session_id
            await self.__validate_db(
                client,
                self.mongo_client["GuHiw"]["Party"].find_one({"id": session_id}),
                "Party not found",
            )

            chat = Chat(session_id=session_id, dialogues=[])
            session = self.mongo_client["GuHiw"]["Chat"].insert_one(chat.model_dump())
            if session is None:
                await client.callback.send_json(
                    {"type": "error", "error": "Unsuccessfully create chat session"}
                )
                return False
            channel: SessionPartyChannel = ("session", session_id)
            self.pub_sub.register(channel, ChatResponse(type="chat", data=chat))
            self.pub_sub.subscribe(channel, client)

        elif isinstance(request, JoinChatRequest):
            session_id = request.session_id
            val_party = await self.__validate_db(
                client,
                self.mongo_client["GuHiw"]["Party"].find_one({"id": session_id}),
                "Party not found",
            )
            val_session = await self.__validate_db(
                client,
                self.mongo_client["GuHiw"]["Chat"].find_one({"session_id": session_id}),
                "Chat not found",
            )
            if val_party or val_session:
                await client.callback.send_json(
                    {"type": "error", "error": "Unsuccessfully join chat"}
                )
                return True

            channel: SessionPartyChannel = ("session", session_id)
            self.pub_sub.subscribe(channel, client)

            join_message = JoinMessage(client.token_data.user_name)

            chat: Chat = self.pub_sub.get(channel).data  # type: ignore
            chat.dialogues.append(join_message)

            dump_dialogues = join_message.model_dump()
            chat_db = self.mongo_client["GuHiw"]["Chat"].find_one_and_update(
                {"session_id": session_id}, {"$push": {"dialogues": dump_dialogues}}
            )

            await self.pub_sub.publish(channel, ChatResponse(type="chat", data=chat))

            if chat_db is None:
                await client.callback.send_json(
                    {"type": "error", "error": "Unsuccessfully join chat"}
                )
                return True

        elif isinstance(request, LeaveChatRequest):
            session_id = request.session_id
            val_party = await self.__validate_db(
                client,
                self.mongo_client["GuHiw"]["Party"].find_one({"id": session_id}),
                "Party not found",
            )
            val_session = await self.__validate_db(
                client,
                self.mongo_client["GuHiw"]["Chat"].find_one({"session_id": session_id}),
                "Chat not found",
            )
            if val_party or val_session:
                return False

            channel: SessionPartyChannel = "session", session_id
            self.pub_sub.unsubscribe(channel, client)

            leave_message = LeaveMessage(client.token_data.user_name)

            chat: Chat = self.pub_sub.get(channel).data  # type: ignore
            chat.dialogues.append(leave_message)

            dump_dialogues = leave_message.model_dump()
            chat_db = self.mongo_client["GuHiw"]["Chat"].find_one_and_update(
                {"session_id": session_id}, {"$push": {"dialogues": dump_dialogues}}
            )

            if chat_db is None:
                await client.callback.send_json(
                    {"type": "error", "error": "Unsuccessfully leave chat"}
                )
                return True
            await self.pub_sub.publish(channel, ChatResponse(type="chat", data=chat))

        elif isinstance(request, SendMessageRequest):
            session_id = request.session_id
            val_session = await self.__validate_db(
                client,
                self.mongo_client["GuHiw"]["Chat"].find_one({"session_id": session_id}),
                "Chat not found",
            )

            channel: SessionPartyChannel = "session", session_id
            chat: Chat = self.pub_sub.get(channel).data  # type: ignore

            added_info_message = request.message.model_copy()
            added_info_message.__dict__.update(
                {
                    "user_id": client.token_data.user_id,
                    "user_name": client.token_data.user_name,
                    "user_first_name": client.token_data.first_name,
                    "user_last_name": client.token_data.last_name,
                }
            )

            chat.dialogues.append(added_info_message)

            dump_dialogues = added_info_message.model_dump()
            chat_db = self.mongo_client["GuHiw"]["Chat"].find_one_and_update(
                {"session_id": session_id}, {"$push": {"dialogues": dump_dialogues}}
            )
            if chat_db is None:
                await client.callback.send_json(
                    {"type": "error", "error": "Unsuccessfully send message"}
                )
                return True
            await self.pub_sub.publish(channel, ChatResponse(type="chat", data=chat))

        elif isinstance(request, CloseChatRequest):
            session_id = request.session_id
            val_party = await self.__validate_db(
                client,
                self.mongo_client["GuHiw"]["Party"].find_one({"id": session_id}),
                "Party not found",
            )
            val_session = await self.__validate_db(
                client,
                self.mongo_client["GuHiw"]["Chat"].find_one({"session_id": session_id}),
                "Chat not found",
            )
            chat_db = self.mongo_client["GuHiw"]["Chat"].find_one_and_update(
                {"id": session_id}, {"$set": {"status": "closed"}}
            )
            channel: SessionPartyChannel = ("session", session_id)
            self.pub_sub.unregister(channel)

        else:
            return False

        return True
