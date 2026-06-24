from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.auth import OnboardingRequest, Token, UserCreate, UserResponse
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


@router.post(
    "/onboarding",
    response_model=UserResponse,
    summary="Onboarding yatırımcı kimliği kaydet",
)
def save_onboarding(
    body: OnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    4 soruluk onboarding testinin cevaplarını (0=A, 1=B, 2=C) alır,
    profil belirler ve kullanıcıya kaydeder.
    A çoğunlukla -> BUFFETT
    B çoğunlukla -> LYNCH
    C çoğunlukla -> WOOD
    """
    counts = [0, 0, 0]  # A, B, C
    for ans in body.answers:
        if 0 <= ans <= 2:
            counts[ans] += 1

    max_count = max(counts)
    profile_map = ["BUFFETT", "LYNCH", "WOOD"]
    # Eşitlik durumunda ilk en yüksek seçilir
    profile = profile_map[counts.index(max_count)]

    current_user.investor_profile = profile
    current_user.onboarding_done = True
    db.commit()
    db.refresh(current_user)
    return current_user
