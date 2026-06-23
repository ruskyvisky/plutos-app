from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserCreate


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Email'e göre kullanıcı getirir."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """ID'ye göre kullanıcı getirir."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserCreate) -> User:
    """
    Yeni kullanıcı oluşturur. Şifreyi hash'leyerek kaydeder.
    Aynı email zaten varsa ValueError fırlatır.
    """
    if get_user_by_email(db, user_data.email):
        raise ValueError("Bu e-posta adresi zaten kayıtlı.")

    hashed = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Email ve şifre doğrularsa User döner, aksi hâlde None döner.
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user
