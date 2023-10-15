import asyncio
import dotenv
import os

from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from uvicorn import Config, Server
from logging import Logger
from handle_req.auth import Auth
from pymongo import MongoClient

dotenv.load_dotenv()
HOST = os.getenv("HOST")
PORT = int(os.getenv("PORT"))
MONGO_URL = os.getenv("MONGO_URL")
logging: Logger = Logger(__name__)
logging.setLevel(0)

middleware = [
    Middleware(CORSMiddleware, allow_origins=['*'],allow_methods=['*'],allow_headers=['*'],allow_credentials=True)
]

async def main() -> None:
    # init app
    app = Starlette(routes=[],middleware=middleware)

    # init mongo client
    mongo_client: MongoClient = MongoClient(MONGO_URL)

    # Add routes
    auth = Auth(mongo_client)
    Auth.load_mongo_client(auth, mongo_client)
    app.routes.extend(auth.route())
    app.add_middleware(middleware)
    # init server
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
