from fastapi import APIRouter
from .models import User, UserInDB
from .utils import hash_password
from ..database import db
from pymongo.results import InsertOneResult
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(user: User):
    user = user.model_dump()
    user["hashed_password"] = hash_password(user["password"])
    user = UserInDB(**user)
    result: InsertOneResult = db.users.insert_one(user.model_dump())
    if result.acknowledged:
        return JSONResponse(status_code=201, content={"message": "User created successfully"})
    