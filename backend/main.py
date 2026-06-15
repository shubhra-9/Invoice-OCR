from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from config import UPLOAD_DIR, OUTPUT_DIR

import uuid
import json
import logging

from ocr import extract_text_from_pdf
from extractor import parse_invoice_text

# --------------------------------------------------
# Configuration
# --------------------------------------------------


UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

ALLOWED_TYPES = ["application/pdf"]

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

# --------------------------------------------------
# Upload Endpoint
# --------------------------------------------------

@app.post("/upload/")
async def upload(file: UploadFile = File(...)):

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    original_filename = file.filename or "invoice.pdf"

    unique_filename = f"{uuid.uuid4()}_{original_filename}"

    file_path = UPLOAD_DIR / unique_filename

    try:
        logger.info(f"Receiving file: {original_filename}")

        content = await file.read()

        with open(file_path, "wb") as f:
            f.write(content)

        logger.info(f"Saved file: {file_path}")

        # OCR Extraction
        logger.info("Running OCR...")

        ocr_text = extract_text_from_pdf(str(file_path))

        # Structured Data Extraction
        logger.info("Parsing invoice fields...")

        extracted_data = parse_invoice_text(ocr_text)

        if not extracted_data.get("Invoice_No") and not extracted_data.get("Purchase_Order"):
            from fastapi.responses import JSONResponse
            logger.warning("File is not recognized as a valid invoice (missing Invoice No and PO).")
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Invalid Document",
                    "message": "The uploaded file does not appear to be a valid invoice (Missing Invoice No and PO)."
                }
            )

        # Save JSON output
        output_path = OUTPUT_DIR / unique_filename.replace(".pdf", ".json")

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(
                extracted_data,
                f,
                indent=4,
                ensure_ascii=False
            )

        logger.info(f"Saved extracted data: {output_path}")

        return extracted_data

    except Exception as e:
        logger.exception("Error processing invoice")

        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )