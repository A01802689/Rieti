import hashlib
import hmac
import secrets

from app.core.config import settings

CODE_LENGTH = 6


def generate_code(length: int = CODE_LENGTH) -> str:
    return str(secrets.randbelow(10**length)).zfill(length)


def generate_token(nbytes: int = 32) -> str:
    return secrets.token_urlsafe(nbytes)

#encryption algorithhm : HMAC-256
def hash_secret(secret: str) -> str:
    return hmac.new(settings.SECRET_KEY.encode(), secret.encode(), hashlib.sha256).hexdigest()


def matches(secret: str, stored_hash: str) -> bool:
    return hmac.compare_digest(hash_secret(secret), stored_hash)
