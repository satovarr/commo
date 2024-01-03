from pydantic import BaseModel, Field, EmailStr
import uuid

class User(BaseModel):
    username: str
    email: EmailStr
    password : str
    confirm_password: str
    full_name: str
    disabled: bool = False


class UserInDB(User):
    # id: uuid.uuid4 = Field(default_factory=uuid.uuid4, alias="_id")
    hashed_password: str
    # remove password and confirm password and add hashed password
    password: str = Field(exclude=True)
    confirm_password: str = Field(exclude=True)


    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "johndoe@secret.com",
                "full_name": "John Doe",
                "disabled": False,
                "hashed_password": "hashed_password"
            }
        }


# class UserLogin(BaseModel):
#     username: str
#     password: str

#     class Config:
#         json_schema_extra = {
#             "example": {
#                 "username": "johndoe",
#                 "password": "secret"
#             }
#         }

# class UserUpdate(BaseModel):
#     username: str
#     email: EmailStr
#     full_name: str
#     disabled: bool = None

#     class Config:
#         json_schema_extra = {
#             "example": {
#                 "username": "johndoe",
#                 "email": "johndoe@secret.com",
#                 "full_name": "John Doe",
#                 "disabled": False
#             }
#         }

# class UserUpdatePassword(BaseModel):
#     password: str = Field(min_length=7)
#     confirm_password: str

#     def validate_password(self):
#         if self.confirm_password != self.password:
#             raise ValueError("Passwords don't match")
#         return self.password

#     class Config:
#         json_schema_extra = {
#             "example": {
#                 "password": "secret",
#                 "confirm_password": "secret"
#             }
#         }
