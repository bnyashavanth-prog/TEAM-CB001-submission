import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models.models import User

bearer = HTTPBearer(auto_error=False)
_secret = os.getenv("AUTH_SECRET", "change-this-local-development-secret")

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 210_000)
    return f"{salt.hex()}:{digest.hex()}"

def verify_password(password: str, stored: str | None) -> bool:
    if not stored or ":" not in stored:
        return False
    salt_hex, digest_hex = stored.split(":", 1)
    actual = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), 210_000).hex()
    return hmac.compare_digest(actual, digest_hex)

def create_token(user: User) -> str:
    payload = {"sub": user.id, "role": user.role, "exp": int(time.time()) + 60 * 60 * 24}
    encoded = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signature = hmac.new(_secret.encode(), encoded.encode(), hashlib.sha256).hexdigest()
    return f"{encoded}.{signature}"

async def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Please sign in")
    try:
        encoded, signature = credentials.credentials.split(".", 1)
        expected = hmac.new(_secret.encode(), encoded.encode(), hashlib.sha256).hexdigest()
        payload = json.loads(base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4)))
        if not hmac.compare_digest(signature, expected) or payload["exp"] < time.time():
            raise ValueError
        user = await db.get(User, payload["sub"])
        if not user:
            raise ValueError
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Your session is invalid or expired")
