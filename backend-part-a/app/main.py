"""FastAPI app factory."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.errors import register_exception_handlers
from app.api.routes_health import router as health_router
from app.api.routes_query import router as query_router
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)
    logger = get_logger(__name__)
    logger.info("app_start", backend=settings.retriever_backend,
                llm=settings.llm_backend)

    app = FastAPI(
        title="Knowledge System - Part A",
        description="Query understanding, orchestration and HTTP API.",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(query_router)
    app.include_router(health_router)
    register_exception_handlers(app)
    return app


app = create_app()
