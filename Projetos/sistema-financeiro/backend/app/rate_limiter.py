from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

RATE_LIMIT_READ = "100/minute"
RATE_LIMIT_WRITE = "30/minute"
RATE_LIMIT_AUTH = "10/minute"
