from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.rate_limiter import limiter, RATE_LIMIT_AUTH
from app.schemas.user import AuthResponse, UserCreate, UserLogin, UserResponse
from app.services.user_service import authenticate_user, register_user


router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit(RATE_LIMIT_AUTH)
def register(
    request: Request,
    user: UserCreate,
    db: Session = Depends(get_db),
) -> AuthResponse:
    new_user = register_user(db=db, user=user)

    if new_user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este email já está cadastrado.",
        )

    return AuthResponse(
        user=new_user,
        message="Usuário cadastrado com sucesso.",
    )


@router.post(
    "/login",
    response_model=AuthResponse,
)
@limiter.limit(RATE_LIMIT_AUTH)
def login(
    request: Request,
    credentials: UserLogin,
    db: Session = Depends(get_db),
) -> AuthResponse:
    user = authenticate_user(
        db=db,
        email=credentials.email,
        password=credentials.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha inválidos.",
        )

    return AuthResponse(
        user=user,
        message="Login realizado com sucesso.",
    )
