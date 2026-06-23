from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.services.user_service import get_user_by_email

# Bearer token şeması
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Authorization: Bearer <token> header'ından kullanıcıyı çeker.
    Token geçersizse 401 fırlatır.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Geçersiz veya süresi dolmuş token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not credentials:
        raise credentials_exception

    email = decode_access_token(credentials.credentials)
    if not email:
        raise credentials_exception

    user = get_user_by_email(db, email)
    if not user or not user.is_active:
        raise credentials_exception

    return user
