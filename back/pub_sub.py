from pydantic import BaseModel
from typing import List, Set, Dict, Callable, Any, TypeVar, Generic, Coroutine, Tuple
from logging import Logger
import logging
from handle_ws.client import Client

from starlette.websockets import WebSocket


# test return of websocket
async def send_test(websocket: WebSocket) -> None:
    await websocket.send_text("test")


# generic callback function
logging.basicConfig(level=logging.NOTSET)

# set logger format
logger: Logger = Logger(__name__)

Channel = Tuple[str, ...]


class PubSubChannelError(Exception):
    pass


class PubSub:
    def __init__(self) -> None:
        self.subscribers: Dict[Channel, Set[Client]] = {}
        self.channel_message: Dict[Channel, BaseModel] = {}

    # TODO: add main method
    def register(self, channel: Channel, message: BaseModel):
        if channel not in self.subscribers:
            self.subscribers[channel] = set()
            self.channel_message[channel] = message
        else:
            raise PubSubChannelError("Channel already exists")

    def unregister(self, channel: Channel):
        for subscriber in self.subscribers[channel]:
            subscriber.remove_service((self, channel))
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
                    self.channel_message[channel].model_dump()
                )
        else:
            raise PubSubChannelError("Channel does not exist")

    def subscribe(self, channel: Channel, client: Client):
        if channel in self.subscribers:
            self.subscribers[channel].add(client)
            client.add_service(self, channel)
        else:
            raise PubSubChannelError("Channel does not exist")

    def unsubscribe(self, channel: Channel, client: Client):
        if channel in self.subscribers:
            self.subscribers[channel].remove(client)
            client.remove_service(self, channel)
        else:
            raise PubSubChannelError("Channel does not exist")

    # def get(self):
    #     pass
