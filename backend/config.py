from pathlib import Path
import os

import pytesseract
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ----------------------------------------
# Tesseract Configuration
# ----------------------------------------

TESSERACT_CMD = os.getenv("TESSERACT_CMD")
if not TESSERACT_CMD:
    import platform
    import shutil
    if platform.system() == "Windows":
        TESSERACT_CMD = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    else:
        TESSERACT_CMD = shutil.which("tesseract") or "tesseract"

pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

# ----------------------------------------
# Poppler Configuration
# ----------------------------------------

POPPLER_PATH_ENV = os.getenv("POPPLER_PATH")
if POPPLER_PATH_ENV:
    POPPLER_PATH = POPPLER_PATH_ENV
else:
    import platform
    if platform.system() == "Windows":
        POPPLER_PATH = (
            r"C:\poppler\poppler-windows-26.02.0-0"
            r"\poppler-26.02.0\Library\bin"
        )
    else:
        POPPLER_PATH = None

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


