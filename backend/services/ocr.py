import re
import logging

import pytesseract
import pdfplumber
from pdf2image import convert_from_path

from services.preprocessing import preprocess_image
from config import POPPLER_PATH, OCR_LANGUAGE

logger = logging.getLogger(__name__)


def clean_text(text: str) -> str:
    # Only replace % with ₹ when followed by a number (e.g. %1,27,500)
    text = re.sub(r"%(?=\d)", "₹", text)
    text = re.sub(r"\$(?=\d)", "₹", text)
    text = re.sub(r"=(?=\d)", "₹", text)
    text = re.sub(r"~(?=\d)", "₹", text)
    text = re.sub(r"\*(?=\d)", "₹", text)
    text = re.sub(r"X(?=\d)", "₹", text)
    text = re.sub(r"<(?=\d)", "₹", text)

    text = re.sub(r"\s&\s", " & ", text)

    text = text.replace("|", " ")
    text = text.replace("—", "-")
    text = re.sub(r"₹\s+", "₹", text)
    text = re.sub(r"[ \t]{2,}", "  ", text)
    return text


def is_digital_pdf(pdf_path: str) -> bool:
    """Check if PDF has real selectable text (not scanned)."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text and len(text.strip()) > 20:
                    return True
    except Exception:
        pass
    return False


def extract_with_pdfplumber(pdf_path: str) -> str:
    """Extract text from digital PDF using pdfplumber — preserves table columns."""
    full_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            full_text += f"\n--- PAGE {i} ---\n"

            # Extract tables first — preserves columns correctly
            tables = page.extract_tables()
            if tables:
                for table in tables:
                    for row in table:
                        if row:
                            cleaned = [cell.strip() if cell else "" for cell in row]
                            full_text += "  |  ".join(cleaned) + "\n"

            # Then extract remaining text
            text = page.extract_text()
            if text:
                full_text += text + "\n"

    return full_text


def extract_with_tesseract(pdf_path: str) -> str:
    """Fallback: extract text from scanned PDF using Tesseract."""
    pages = convert_from_path(pdf_path, dpi=400, poppler_path=POPPLER_PATH)
    full_text = ""
    for i, page in enumerate(pages, start=1):
        processed = preprocess_image(page)
        text = pytesseract.image_to_string(
            processed,
            lang=OCR_LANGUAGE,
            config="--oem 3 --psm 4"
        )
        if text.strip():
            full_text += f"\n--- PAGE {i} ---\n{text}"
    return full_text


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Smart extractor:
    - Digital PDF → pdfplumber (accurate, preserves columns)
    - Scanned PDF → Tesseract (fallback)
    """
    try:
        if is_digital_pdf(pdf_path):
            logger.info("Digital PDF detected → using pdfplumber")
            raw = extract_with_pdfplumber(pdf_path)
        else:
            logger.info("Scanned PDF detected → using Tesseract")
            raw = extract_with_tesseract(pdf_path)

        full_text = clean_text(raw)

        print("=== RAW OCR TEXT ===")
        print(full_text)
        print("=== END OCR TEXT ===")

        return full_text

    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {e}")