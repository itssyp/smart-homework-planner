from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from ..dependencies import CurrentUser, DbSession
from ..models import User
from ..schemas import MessageResponse, PasswordChangeInput, UserProfileOut, UserProfileUpdateInput, UsernameUpdateRequest
from ..security import hash_password, verify_password


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfileOut)
def get_current_user_profile(current_user: CurrentUser) -> UserProfileOut:
    return UserProfileOut(
        id=current_user.id,
        username=current_user.user_name,
        email=current_user.email,
        day_streak=current_user.day_streak,
        academic_level=current_user.academic_level,
        degree=current_user.degree,
        specialization=current_user.specialization,
        gender=current_user.gender,
    )


@router.put("/me", response_model=UserProfileOut)
def update_current_user_profile(payload: UserProfileUpdateInput, current_user: CurrentUser, db: DbSession) -> UserProfileOut:
    normalized_username = payload.username.strip()
    normalized_email = payload.email.strip().lower()
    username_exists = db.scalar(
        select(User).where(func.lower(User.user_name) == normalized_username.lower(), User.id != current_user.id)
    )
    if username_exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")
    email_exists = db.scalar(
        select(User).where(func.lower(User.email) == normalized_email, User.id != current_user.id)
    )
    if email_exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

    current_user.user_name = normalized_username
    current_user.name = normalized_username
    current_user.email = normalized_email
    current_user.academic_level = payload.academic_level
    current_user.degree = payload.degree.strip() if payload.degree else None
    current_user.specialization = payload.specialization.strip() if payload.specialization else None
    current_user.gender = payload.gender.strip() if payload.gender else None
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username or email already exists")
    db.refresh(current_user)
    return UserProfileOut(
        id=current_user.id,
        username=current_user.user_name,
        email=current_user.email,
        day_streak=current_user.day_streak,
        academic_level=current_user.academic_level,
        degree=current_user.degree,
        specialization=current_user.specialization,
        gender=current_user.gender,
    )


@router.put("/me/password", response_model=MessageResponse)
def change_password(payload: PasswordChangeInput, current_user: CurrentUser, db: DbSession) -> MessageResponse:
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return MessageResponse(message="Password updated")


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
