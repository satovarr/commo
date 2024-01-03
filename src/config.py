#import .env

from starlette.config import Config

config = Config(".env")

MONGO_URI = config("MONGO_URI")