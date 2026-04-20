from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..dependencies import CurrentUser, DbSession
from ..models import User
from ..schemas import MessageResponse, UsernameUpdateRequest


router = APIRouter(prefix="/users", tags=["users"])


@router.put("/update-username", response_model=str)
def update_username(payload: UsernameUpdateRequest, current_user: CurrentUser, db: DbSession) -> str:
    normalized = payload.newUsername.strip()
    exists = db.scalar(
        select(User).where(User.user_name == normalized, User.id != current_user.id)
    )
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")

    current_user.user_name = normalized
    current_user.name = normalized
    db.commit()
    return normalized


@router.delete("/delete/{user_id}", response_model=MessageResponse)
def delete_user(user_id: str, current_user: CurrentUser, db: DbSession) -> MessageResponse:
    if str(current_user.id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another user")

    db.delete(current_user)
    db.commit()
    return MessageResponse(message="User deleted")
