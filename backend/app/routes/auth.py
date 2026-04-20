from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select

from ..dependencies import CurrentUser, DbSession
from ..models import User
from ..schemas import LoginPreferences, MessageResponse, UserDataIncoming, UserDataOutgoing
from ..security import create_access_token, verify_password
from ..services import build_registration_user, ensure_user_preferences, user_to_auth_payload


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserDataOutgoing, status_code=status.HTTP_201_CREATED)
def register(payload: UserDataIncoming, db: DbSession) -> UserDataOutgoing:
    existing = db.scalar(select(User).where(User.user_name == payload.username.strip()))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")

    user = build_registration_user(payload)
    ensure_user_preferences(user, payload.theme, payload.language)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user_to_auth_payload(user)


@router.post("/login", response_model=UserDataOutgoing)
def login(payload: UserDataIncoming, response: Response, db: DbSession) -> UserDataOutgoing:
    user = db.scalar(select(User).where(User.user_name == payload.username.strip()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    ensure_user_preferences(user, payload.theme, payload.language)
    token = create_access_token(user.id)
    response.headers["Authorization"] = f"Bearer {token}"
    db.commit()
    db.refresh(user)
    return user_to_auth_payload(user)


@router.post("/logout", response_model=MessageResponse)
def logout(payload: LoginPreferences, current_user: CurrentUser, db: DbSession) -> MessageResponse:
    ensure_user_preferences(current_user, payload.theme, payload.language)
    db.commit()
    return MessageResponse(message="Logged out")
