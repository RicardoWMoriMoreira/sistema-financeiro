import hashlib
import hmac
import secrets

from sqlalchemy.orm import Session

from app.repositories import user_repository
from app.schemas.user import UserCreate, UserResponse


PBKDF2_PREFIX = "pbkdf2_sha256"
PBKDF2_ITERATIONS = 390000


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        PBKDF2_ITERATIONS,
    ).hex()
    return f"{PBKDF2_PREFIX}${PBKDF2_ITERATIONS}${salt}${password_hash}"


def is_legacy_sha256(password_hash: str) -> bool:
    return (
        len(password_hash) == 64
        and "$" not in password_hash
        and all(c in "0123456789abcdef" for c in password_hash.lower())
    )


def verify_password(password: str, stored_hash: str) -> bool:
    if stored_hash.startswith(f"{PBKDF2_PREFIX}$"):
        try:
            _, iterations_str, salt, expected_hash = stored_hash.split("$", maxsplit=3)
            iterations = int(iterations_str)
        except (ValueError, TypeError):
            return False

        computed_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations,
        ).hex()
        return hmac.compare_digest(computed_hash, expected_hash)

    # Backward compatibility for users created before the migration.
    legacy_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return hmac.compare_digest(legacy_hash, stored_hash)


def register_user(
    db: Session,
    user: UserCreate,
) -> UserResponse | None:
    existing_user = user_repository.find_user_by_email(
        db=db,
        email=user.email,
    )

    if existing_user is not None:
        return None

    password_hash = hash_password(user.password)

    new_user = user_repository.create_user(
        db=db,
        user=user,
        password_hash=password_hash,
    )

    return UserResponse.model_validate(new_user)


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> UserResponse | None:
    user = user_repository.find_user_by_email(
        db=db,
        email=email,
    )

    if user is None:
        return None

    if not verify_password(password, user.password_hash):
        return None

    # Upgrade old password hashes opportunistically after successful login.
    if is_legacy_sha256(user.password_hash):
        user.password_hash = hash_password(password)
        db.add(user)
        db.commit()
        db.refresh(user)

    return UserResponse.model_validate(user)
