from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route
import asyncio
from uvicorn import Config, Server
import dotenv
import os
import sys
from logging import Logger

dotenv.load_dotenv()
HOST = os.getenv("HOST")
PORT = int(os.getenv("PORT"))
logging: Logger = Logger(__name__)
logging.setLevel(0)


async def homepage(request):
    return JSONResponse({"hello": "world"})


async def kuy(request):
    logging.info("kuy")
    return JSONResponse({"hello": "kuy"})


async def main() -> None:
    app = Starlette()

    app.add_route("/kuy", kuy, methods=["GET"])

    server: Server = Server(
        Config(
            app=app,
            port=PORT,
        )
    )
    logging.info(f"Starting server on {str(HOST)}:{str(PORT)}")
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())
