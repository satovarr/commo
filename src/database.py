from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

from .config import MONGO_URI
uri = MONGO_URI
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("You successfully connected to MongoDB")
except Exception as e:
    print(e)


# create a database
db = client.commo