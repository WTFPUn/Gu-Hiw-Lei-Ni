from starlette.applications import Starlette
import asyncio
from uvicorn import Config, Server
import dotenv
import os
from logging import Logger

dotenv.load_dotenv()
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")

logging: Logger = Logger(__name__)
# set loggiing format
logging

logging.warning(f"eoiei")
logging.info(f"PORT: {PORT}")


async def main() -> None:
    # app = Starlette()

    # server: Server = Server(
    #     Config(
    #         app=app,
    #         port=PORT,
    #     )
    # )
    # logging.info(f"Starting server on {str(HOST)}:{str(PORT)}")

    # await server.serve()
    logging.info("Starting server")


# if __name__ == "__main__":
#     asyncio.run(main())
#     # pass
