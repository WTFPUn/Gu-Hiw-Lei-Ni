from pydantic import BaseModel
from typing import List, Set, Dict, Callable, Any, TypeVar, Generic, Coroutine
from logging import Logger
import logging

from starlette.websockets import WebSocket


# test return of websocket
async def send_test(websocket: WebSocket) -> None:
    await websocket.send_text("test")


# generic callback function
logging.basicConfig(level=logging.NOTSET)

# set logger format
logger: Logger = Logger(__name__)


class PubSub:
    # TODO: add main method
    def register(self, channel: Set[str]):
        pass

    def unregister(self, channel: Set[str]):
        pass

    def publish(self, channel: str, message: Any):
        pass

    def subscribe(
        self, channel: str, callback: Callable[[str, Any], Coroutine[Any, Any, None]]
    ):
        pass

    def unsubscribe(
        self, channel: str, callback: Callable[[str, Any], Coroutine[Any, Any, None]]
    ):
        pass

    def get(self):
        pass
