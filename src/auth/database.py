from .models import UserInDB, UserLogin
from ..database import db


def get_user(db, username: str ) -> UserInDB | None:
    result = db.find_one({"username": username})
    if result:
        db_user = UserInDB(**result)
        return db_user
    return None
    

