from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserResponse
from app.services.user_service import authenticate_user, create_user

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Yeni kullanıcı kaydı",
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    E-posta ve şifre ile yeni kullanıcı oluşturur.
    E-posta zaten kayıtlıysa 400 döner.
    """
    try:
        user = create_user(db, user_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Giriş yap — JWT token döner",
)
def login(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    E-posta / şifre doğrularsa access_token döner.
    Hatalı bilgiler için 401 döner.
    """
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre hatalı.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": user.email})
    return Token(access_token=token, token_type="bearer", user=user)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Mevcut kullanıcı bilgisi",
)
def get_me(current_user: User = Depends(get_current_user)):
    """Token'dan kullanıcı bilgisini döner."""
    return current_user
