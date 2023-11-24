from pydantic import BaseModel
from typing import List, Set, Dict, Callable, Any, TypeVar, Generic, Coroutine, Tuple
from logging import Logger
import logging
from handle_ws.client import Client
from type.ws.response_ws import ResponseWs
import json
from starlette.websockets import WebSocket
from type.ws.error import PubSubChannelError


# test return of websocket
async def send_test(websocket: WebSocket) -> None:
    await websocket.send_text("test")


# generic callback function
logging.basicConfig(level=logging.NOTSET)

# set logger format
logger: Logger = Logger(__name__)

Channel = Tuple[str, ...]


class PubSub:
    def __init__(self) -> None:
        self.subscribers: Dict[Channel, Set[Client]] = {}
        self.channel_message: Dict[Channel, ResponseWs] = {}

    # TODO: add main method
    def register(self, channel: Channel, message: ResponseWs):
        if channel not in self.subscribers:
            self.subscribers[channel] = set()
            self.channel_message[channel] = message
        else:
            raise PubSubChannelError("Channel already exists")

    def unregister(self, channel: Channel):
        copy_subscribers = self.subscribers[channel].copy()
        for subscriber in copy_subscribers:
            self.unsubscribe(channel, subscriber)
        if channel in self.subscribers:
            del self.subscribers[channel]
            del self.channel_message[channel]
        else:
            raise PubSubChannelError("Channel does not exist")

    async def publish(self, channel: Channel, message: Any):
        if channel in self.subscribers:
            self.channel_message[channel] = message
            for subscriber in self.subscribers[channel]:
                await subscriber.callback.send_json(
                    json.loads(self.channel_message[channel].model_dump_json())
                )
        else:
            raise PubSubChannelError("Channel does not exist")

    def subscribe(self, channel: Channel, client: Client):
        if channel in self.subscribers:
            self.subscribers[channel].add(client)
            client.add_service((self, channel))
        else:
            raise PubSubChannelError("Channel does not exist")

    def unsubscribe(self, channel: Channel, client: Client):
        if channel in self.subscribers:
            self.subscribers[channel].remove(client)
            client.remove_service((self, channel))
        else:
            raise PubSubChannelError("Channel does not exist")

    def get(self, channel: Channel) -> BaseModel:
        if channel in self.channel_message:
            return self.channel_message[channel]
        else:
            raise PubSubChannelError("Channel does not exist")
