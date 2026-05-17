from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.rate_limiter import limiter
from app.routes.budgets import router as budgets_router
from app.routes.categories import router as categories_router
from app.routes.credit_cards import router as credit_cards_router
from app.routes.goals import router as goals_router
from app.routes.piggy_banks import router as piggy_banks_router
from app.routes.recurring_transactions import router as recurring_transactions_router
from app.routes.transactions import router as transactions_router
from app.routes.users import router as users_router


settings = get_settings()


app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
)


@app.get("/")
def read_root():
    return {
        "message": "API do sistema financeiro funcionando"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
    }


app.include_router(budgets_router)
app.include_router(categories_router)
app.include_router(credit_cards_router)
app.include_router(goals_router)
app.include_router(piggy_banks_router)
app.include_router(recurring_transactions_router)
app.include_router(transactions_router)
app.include_router(users_router)