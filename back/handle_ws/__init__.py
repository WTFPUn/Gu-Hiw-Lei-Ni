from handle_ws.ws_service import WebSocketService
from handle_ws.client import Client
from typing import Dict
from pydantic import BaseModel

from starlette.websockets import WebSocket


class WebSocketMultiplexer:
  clients: Dict[str, Client] = {}
  services: Dict[str, WebSocketService] = {}

  async def handle_mux(self, websocket: WebSocket):
    # validate model first
    try:
      # TODO: validate model, if it valid send request to service, else send error and close connection
