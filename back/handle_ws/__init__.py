from handle_ws.ws_service import WebSocketService
from handle_ws.client import Client
from typing import Dict, Union, Annotated, Literal, List
from pydantic import BaseModel, Field, TypeAdapter
from pymongo import MongoClient
from logging import Logger
import logging

from starlette.websockets import WebSocket
from starlette.endpoints import WebSocketEndpoint

logging.basicConfig(level=logging.NOTSET)

# set logger format
logger: Logger = Logger(__name__)

# import Type Zone
from handle_ws.ws_service.ws_party import PartyHandlerRequest


class Temp(BaseModel):
    type: Literal["temp"] = "temp"
    data: str


# import handler zone
from handle_ws.ws_service.ws_party import PartyHandler

partyHandler = PartyHandler()

handler: Dict[str, WebSocketService] = {
    partyHandler.__class__.__name__: partyHandler,
}

MuxRequestParsing = Annotated[
    Union[PartyHandlerRequest, Temp], Field(discriminator="type")
]


class WSRequest(BaseModel):
    type: Literal["ws"] = "ws"
    token: str
    data: MuxRequestParsing


class WSConnectRequest(BaseModel):
    type: Literal["ws_connect"] = "ws_connect"
    token: str


WSRequestParsing = Annotated[
    Union[WSRequest, WSConnectRequest], Field(discriminator="type")
]

parsingAdapter = TypeAdapter(WSRequestParsing)


class WebSocketMultiplexer:
    clients: Dict[str, Client] = {}
    services: Dict[str, WebSocketService] = {}
    mongo_client: MongoClient
    handler: Dict[str, WebSocketService] = handler
    logger = logger.getChild("WebSocketMultiplexer")

    def __init__(self, mongo_client: MongoClient) -> None:
        self.mongo_client = mongo_client

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
                    client = Client(request.token, websocket)
                    self.clients[request.token] = client
                    # verify token is valid
                    # implement laters

                    await websocket.send_json({"type": "success", "data": "connected"})
                elif isinstance(request, WSRequest):
                    assert request.token in self.clients, "Client not connected"
                    client = self.clients[request.token]
                    ws_request = request.data
                    await client.callback.send_json(
                        {"type": "success", "data": "connected"}
                    )

                else:
                    await websocket.close()
                    self.logger.error("Invalid request type")
                    return
        except AssertionError as e:
            await websocket.send_json({"type": "error", "data": str(e)})
            await websocket.close()
            return
        except Exception as e:
            print(e)
            await websocket.close()
            return
