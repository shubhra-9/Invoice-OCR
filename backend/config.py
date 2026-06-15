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
# Directories
# ----------------------------------------

BASE_DIR = Path(__file__).parent

UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "output"

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)