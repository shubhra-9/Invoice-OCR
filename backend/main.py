from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import os

import uuid
import json
import logging

from services.ocr import extract_text_from_pdf
from services.extractor import parse_invoice_text

from db.database import engine, get_db, Base
import db.models as models
from routers import repos, webhooks, documents, sap
from auth.security import get_current_user

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
# CORS
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

# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok"
    }

app.include_router(repos.router, prefix="/repos", tags=["repos"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
app.include_router(documents.router, tags=["documents"])
app.include_router(sap.router)