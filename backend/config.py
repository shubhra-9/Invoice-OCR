from pathlib import Path
import os

import pytesseract
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ----------------------------------------
# Tesseract Configuration
# ----------------------------------------

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

# ----------------------------------------
# Poppler Configuration
# ----------------------------------------

POPPLER_PATH = (
    r"C:\poppler\poppler-windows-26.02.0-0"
    r"\poppler-26.02.0\Library\bin"
)

# ----------------------------------------
# OCR Configuration
# ----------------------------------------

OCR_LANGUAGE = "eng"
OCR_CONFIG = r"--oem 3 --psm 6"

# ----------------------------------------
# Groq Configuration
# ----------------------------------------

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.3-70b-versatile"

# ----------------------------------------
# SAP Configuration
# ----------------------------------------

SAP_TOKEN_URL = os.getenv("SAP_TOKEN_URL", "")
SAP_CLIENT_ID = os.getenv("SAP_CLIENT_ID", "")
SAP_CLIENT_SECRET = os.getenv("SAP_CLIENT_SECRET", "")
SAP_SCOPE = os.getenv("SAP_SCOPE", "")
SAP_ODATA_URL = os.getenv("SAP_ODATA_URL", "")
SAP_REQUIRE_CSRF = os.getenv("SAP_REQUIRE_CSRF", "true").lower() == "true"

