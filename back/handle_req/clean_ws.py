from starlette.responses import JSONResponse
from starlette.requests import Request
from handle_ws import WebSocketMultiplexer
from pydantic import BaseModel
import os

test_key = os.getenv("TEST_KEY")


async def clean_ws(request: Request) -> JSONResponse:
    body = await request.json()
    if body["test_key"] != test_key:
        return JSONResponse({"status": False})

    WebSocketMultiplexer.clean_mux()
    return JSONResponse({"status": True})
