from tkinter import W
from pub_sub import Channel
from handle_ws.ws_service import WebSocketService
from handle_ws.client import Client
from typing import Dict, Union, Annotated, Literal, List
from pydantic import BaseModel, Field, TypeAdapter
from pymongo import MongoClient
from logging import Logger
import logging
import json
from starlette.websockets import WebSocketState

from starlette.websockets import WebSocket, WebSocketDisconnect
from starlette.endpoints import WebSocketEndpoint
from type.ws.error import PubSubChannelError

logging.basicConfig(level=logging.NOTSET)

# set logger format
logger: Logger = Logger(__name__)

# import Type Zone
from handle_ws.ws_service.ws_party import PartyHandlerRequest
from handle_ws.ws_service.ws_chat import ChatHandleRequest

from type.ws.error import HandleRequestError


# import handler zone
from handle_ws.ws_service.ws_party import PartyHandler
from handle_ws.ws_service.ws_chat import ChatHandler

partyHandler = PartyHandler()
chatHandler = ChatHandler()

handler: Dict[str, WebSocketService] = {
    partyHandler.__class__.__name__.lower(): partyHandler,
    chatHandler.__class__.__name__.lower(): chatHandler,
}

MuxRequestParsing = Annotated[
    Union[PartyHandlerRequest, ChatHandleRequest], Field(discriminator="type")
]


class WSRequest(BaseModel):
    type: Literal["ws"] = "ws"
    token: str
    service: str
    data: MuxRequestParsing


class WSConnectRequest(BaseModel):
    type: Literal["ws_connect"] = "ws_connect"
    token: str


class PubSubChannel(BaseModel):
    type: Literal["sub", "unsub", "get"]
    token: str
    service: str
    channel: Channel


WSRequestParsing = Annotated[
    Union[WSRequest, WSConnectRequest, PubSubChannel], Field(discriminator="type")
]

parsingAdapter = TypeAdapter(WSRequestParsing)


class WebSocketMultiplexer:
    clients: Dict[str, Client] = {}
    mongo_client: MongoClient
    handler: Dict[str, WebSocketService] = handler
    logger = logger.getChild("WebSocketMultiplexer")

    def __init__(self, mongo_client: MongoClient) -> None:
        self.mongo_client = mongo_client
        for service in self.handler.values():
            service.set_mongo_client(mongo_client)

    async def handle_mux(self, websocket: WebSocket):
        # validate model first
        try:
            # TODO: validate model, if it valid send request to service, else send error and close connection
            await websocket.accept()

            while True:
                request = await websocket.receive_json()
                request = parsingAdapter.validate_python(request)

                # get client from request
                if isinstance(request, WSConnectRequest):
                    tokendata = Client.decode_token(request.token)
                    if tokendata.user_id in self.clients:
                        # check if client is in closed state, set websocket to new websocket
                        if (
                            self.clients[tokendata.user_id].callback.client_state
                            == WebSocketState.DISCONNECTED
                        ):
                            self.clients[tokendata.user_id].callback = websocket
                            await websocket.send_json(
                                {"type": "success", "data": "reconnected"}
                            )
                    else:
                        client = Client(request.token, websocket)
                        self.clients[client.token_data.user_id] = client
                    # verify token is valid
                    # implement laters

                    await websocket.send_json({"type": "success", "data": "connected"})
                elif isinstance(request, WSRequest):
                    tokendata = Client.decode_token(request.token)
                    assert tokendata.user_id in self.clients, "Client not connected"
                    client = self.clients[tokendata.user_id]
                    if not await self.handler[request.service].handle_ws(
                        request.data, client, self.handler
                    ):
                        raise HandleRequestError("handle request error")
                elif isinstance(request, PubSubChannel):
                    tokendata = Client.decode_token(request.token)
                    assert tokendata.user_id in self.clients, "Client not connected"
                    if request.type == "sub":
                        self.clients[tokendata.user_id].add_service(
                            (self.handler[request.service].pub_sub, request.channel)
                        )
                    elif request.type == "unsub":
                        self.clients[tokendata.user_id].remove_service(
                            (self.handler[request.service].pub_sub, request.channel)
                        )
                    elif request.type == "get":
                        await websocket.send_json(
                            {
                                "type": "success",
                                "data": json.loads(
                                    self.handler[request.service]
                                    .pub_sub.get(request.channel)
                                    .model_dump_json()
                                ),
                            }
                        )
                    else:
                        await websocket.send_json(
                            {"type": "error", "data": "Invalid request type"}
                        )
                else:
                    await websocket.close()
                    self.logger.error("Invalid request type")
                    return
        except WebSocketDisconnect as e:
            if e.code == 1000:
                # if client close connection, just pass
                pass

        except AssertionError as e:
            await websocket.send_json({"type": "error", "data": str(e)})
            await websocket.close()
            return
        except HandleRequestError as e:
            await websocket.send_json({"type": "error", "data": str(e)})
            await websocket.close()
            return
        except PubSubChannelError as e:
            await websocket.send_json({"type": "error", "data": str(e)})
            return
        except Exception as e:
            print(e)
            await websocket.close()
            return

    @classmethod
    async def clean_mux(cls):
        for handler in cls.handler.values():
            handler.pub_sub.clean()
            handler.__init__()

        for client in cls.clients.values():
            await client.callback.close()

        cls.clients = {}
