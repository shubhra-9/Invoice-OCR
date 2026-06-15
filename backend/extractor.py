import json
import logging
from typing import TypedDict, List, Optional, Union
from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL

logger = logging.getLogger(__name__)

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


class VendorDetails(TypedDict):
    Vendorname: Optional[str]
    Vendoremail: Optional[str]


class BuyerDetails(TypedDict):
    Buyername: Optional[str]
    Buyeremail: Optional[str]


class InvoiceItem(TypedDict):
    itemname: Optional[str]
    item_quantity: Optional[Union[int, float]]
    itemunit_price: Optional[Union[int, float]]
    amount: Optional[Union[int, float]]


class InvoiceData(TypedDict):
    Invoice_No: Optional[Union[str, int]]
    Purchase_Order: Optional[Union[str, int]]
    Date_of_Invoice: Optional[str]
    Vendor: Optional[VendorDetails]
    Buyer: Optional[BuyerDetails]
    Items: List[InvoiceItem]
    Total_Amount_Before_Tax: Optional[Union[int, float]]
    Tax: Optional[str]
    Total_Amount_After_Tax: Optional[Union[int, float]]
    Due_Amount: Optional[Union[int, float]]


def empty_invoice() -> dict:
    return {
        "Invoice_No": None,
        "Purchase_Order": None,
        "Date_of_Invoice": None,
        "Vendor": None,
        "Buyer": None,
        "Items": [],
        "Total_Amount_Before_Tax": None,
        "Tax": None,
        "Total_Amount_After_Tax": None,
        "Due_Amount": None
    }


def parse_invoice_text(ocr_text: str) -> dict:
    if not ocr_text or not ocr_text.strip():
        logger.warning("No OCR text found.")
        return empty_invoice()

    if not client:
        logger.error("Groq API key not configured.")
        return empty_invoice()

    prompt = f"""
You are an invoice data extraction engine. Extract fields from the OCR text below and return valid JSON.

CRITICAL: NUMBER ACCURACY RULES
- NEVER add or remove digits from any number. 150 is 150, NOT 1500 or 15.
- NEVER combine two separate numbers into one. "150  850" means Qty=150 and Rate=850, NOT 150850.
- Remove commas from numbers only (1,27,500 → 127500). Do NOT remove digits.
- Remove currency symbols (₹, =, $, %) but keep all digits intact.

CRITICAL: TABLE COLUMN ORDER
Columns are always: Description | Qty | Rate | Amount
- Qty   = small whole number (units ordered). e.g. 1, 50, 150, 300
- Rate  = price per unit. e.g. 850, 2400, 35000
- Amount = Qty x Rate. Always the LARGEST number in the row.

HOW TO READ EACH ROW:
Step 1 — Extract ALL numbers from the row (ignore ₹, =, $, commas)
Step 2 — Largest number = Amount
Step 3 — Check remaining numbers: find Qty and Rate such that Qty x Rate = Amount
Step 4 — VERIFY: Qty x Rate = Amount. If not, fix Rate = Amount / Qty

HANDLING MISSING COLUMNS (OCR drops columns sometimes):
- 3 numbers found → [Qty, Rate, Amount]
- 2 numbers found → [Rate, Amount]. Calculate Qty = round(Amount / Rate)
- 1 number found  → Amount only. Set Qty = 1, Rate = Amount

REAL EXAMPLES from invoices like this:
Example 1:
OCR row: "Automotive Wiring Harness Assembly  850  =1,27,500"
Numbers extracted: 850, 127500
→ 2 numbers → Rate=850, Amount=127500
→ Qty = round(127500 / 850) = 150
→ VERIFY: 150 x 850 = 127500 ✅
→ item_quantity: 150
→ itemunit_price: 850
→ amount: 127500

Example 2:
OCR row: "PCB Control Modules  2,400  1,20,000"
Numbers extracted: 2400, 120000
→ 2 numbers → Rate=2400, Amount=120000
→ Qty = round(120000 / 2400) = 50
→ VERIFY: 50 x 2400 = 120000 ✅

Example 3:
OCR row: "Quality Inspection & Testing Service  35,000  35,000"
Numbers extracted: 35000, 35000
→ both numbers equal → Qty=1, Rate=35000, Amount=35000
→ VERIFY: 1 x 35000 = 35000 ✅

FIELDS TO EXTRACT:
1. Invoice_No: Invoice number (string or number)
2. Purchase_Order: PO number if present, else null
3. Date_of_Invoice: Invoice date as written
4. Vendor: {{"Vendorname": "...", "Vendoremail": "..."}} — seller at top of invoice
5. Buyer: {{"Buyername": "...", "Buyeremail": "..."}} — Bill To party
6. Items: Array of:
   {{
     "itemname": "...",
     "item_quantity": <exact whole number — do not alter digits>,
     "itemunit_price": <exact number — do not alter digits>,
     "amount": <exact number — do not alter digits>
   }}
7. Total_Amount_Before_Tax: Subtotal before tax (number)
8. Tax: percentage as "18%" or fixed amount as string e.g. "60570"
9. Total_Amount_After_Tax: Total after tax (number)
10. Due_Amount: Balance Due if mentioned, else Total_Amount_After_Tax (number)

STRICT OUTPUT RULES:
- Output ONLY raw JSON. No markdown, no explanation, no extra keys.
- Strip commas and currency symbols from numbers. Keep all digits exactly as-is.
- Missing fields → null.

OCR TEXT:
{ocr_text}
"""

    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise invoice extraction engine. "
                        "Table columns are always: Description | Qty | Rate | Amount. "
                        "Amount is always the largest number in a row. "
                        "When OCR drops the Qty column, calculate Qty = round(Amount / Rate). "
                        "NEVER alter digits of any number. 150 stays 150, never 1500. "
                        "Always verify Qty x Rate = Amount before outputting. "
                        "Output strictly valid raw JSON only, no markdown, no explanation."
                    )
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=GROQ_MODEL,
            temperature=0.0,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content

        if not content:
            logger.error("Groq returned an empty response.")
            return empty_invoice()

        result = json.loads(content)

        # Remove any internal reasoning keys
        result.pop("_calculation_verification", None)
        result.pop("_reasoning", None)

        # Merge missing keys with defaults
        defaults = empty_invoice()
        for key, value in defaults.items():
            if key not in result:
                result[key] = value

        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Groq JSON response: {e}\nRaw: {content}")
        return empty_invoice()
    except Exception as e:
        logger.error(f"Groq API Error: {e}")
        raise ValueError(f"Groq API Error: {e}")