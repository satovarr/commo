#import .env

from starlette.config import Config

config = Config(".env")

MONGO_URI = config("MONGO_URI")

SECRET = config("SECRET")
ALGORITHM = config("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = config("ACCESS_TOKEN_EXPIRE_MINUTES", cast=int)