from fastapi import APIRouter, Depends, HTTPException, status
from .models import User, UserInDB, UserLogin, Token, BaseUser
from .utils import verify_password, create_access_token, authenticate_user, get_current_active_user, get_current_user
from ..database import db
from pymongo.results import InsertOneResult
from fastapi.responses import JSONResponse

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Annotated
from src.config import SECRET, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


router = APIRouter(tags=["auth"])

@router.post("/register")
def register(user: User):
    user = user.model_dump()
    user = UserInDB(**user)
    result: InsertOneResult = db.users.insert_one(user.model_dump())
    if result.acknowledged:
        return JSONResponse(status_code=201, content={"message": "User created successfully"})
    
    return JSONResponse(status_code=500, content={"message": "Something went wrong"})

@router.post("/login")
def login(user: UserLogin):
    user = user.model_dump()
    db_user = db.users.find_one({"username": user["username"]})
    if db_user:
        db_user = UserInDB(**db_user)
        if verify_password(user["password"], db_user.hashed_password):
            return JSONResponse(status_code=200, content={"message": "User logged in successfully"})
    return JSONResponse(status_code=404, content={"message": "User not found"})


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    login_user = UserLogin(username=form_data.username, password=form_data.password)
    user: UserInDB | None = authenticate_user(db.users, login_user)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me/", response_model=BaseUser)
async def read_users_me(
    current_user: Annotated[UserInDB, Depends(get_current_active_user)]
):
    
    return current_user.model_dump()


@router.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return [{"item_id": "Foo", "owner": current_user.username}]
