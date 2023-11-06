import asyncio
import dotenv
import os

from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from uvicorn import Config, Server
from logging import Logger
from handle_req.maps import Maps
from handle_req.auth import Auth
from handle_ws import WebSocketMultiplexer
from pymongo import MongoClient

dotenv.load_dotenv()
HOST = os.getenv("HOST")
PORT = int(os.getenv("PORT"))
MONGO_URL = os.getenv("MONGO_URL")
logging: Logger = Logger(__name__)
logging.setLevel(0)


async def main() -> None:
    # init app

    #
    app = Starlette()
    app.add_middleware(
        CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
    )

    # init mongo client
    mongo_client: MongoClient = MongoClient(MONGO_URL)

    # Add routes
    auth = Auth(mongo_client)
    auth.load_mongo_client(mongo_client)
    auth.load_google_api_key(os.getenv("GOOGLE_API_KEY"))  # type: ignore

    map = Maps(mongo_client)
    map.load_mongo_client(mongo_client)
    map.load_google_api_key(os.getenv("GOOGLE_API_KEY"))  # type: ignore

    app.routes.extend(auth.route())

    # init mux
    mux = WebSocketMultiplexer(mongo_client)
    app.add_websocket_route("/ws", mux.handle_mux)

    # init server
    server: Server = Server(
        Config(
            app=app,
            host=HOST,
            port=PORT,
        )
    )
    logging.info(f"Starting server on {str(HOST)}:{str(PORT)}")
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())
