from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import logging

from db.database import engine, Base
import db.models  # Required to register tables with SQL Alchemy Base metadata
from routers import repos, webhooks, documents

# Create database tables
Base.metadata.create_all(bind=engine)



logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------

app = FastAPI(
    title="Invoice OCR API",
    description="Extract structured invoice data from PDF files",
    version="1.0.0"
)

# --------------------------------------------------
# CORS Starlette handles it
# the fast api object ,app, method is used to add a middleware CORS to handle request which have some parameters to instantiate 
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/health")
def health():
    return {
        "status": "ok"
    }

app.include_router(repos.router, prefix="/repos", tags=["repos"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
app.include_router(documents.router, tags=["documents"])