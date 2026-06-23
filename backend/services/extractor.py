import json
import logging
from typing import TypedDict, List, Optional, Union
from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL

logger = logging.getLogger(__name__)

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

class InvoiceHeader(TypedDict):
    Invoice_No: Optional[str]
    Purchase_Order: Optional[str]
    Date_of_Invoice: Optional[str]
    Vendor_Name: Optional[str]
    Vendor_Email: Optional[str]
    Vendor_GSTIN: Optional[str]
    Buyer_Name: Optional[str]
    Buyer_Email: Optional[str]
    Buyer_GSTIN: Optional[str]
    Currency: Optional[str]
    Payment_Terms: Optional[str]
    Total_Amount_Before_Tax: Optional[Union[int, float]]
    Tax: Optional[Union[int, float]]
    Total_Amount_After_Tax: Optional[Union[int, float]]
    Due_Amount: Optional[Union[int, float]]

class InvoiceItem(TypedDict):
    Line_No: int
    Item_Code: Optional[str]
    Description: Optional[str]
    HSN_SAC_Code: Optional[str]
    Quantity: Optional[Union[int, float]]
    Unit_Of_Measure: Optional[str]
    Unit_Price: Optional[Union[int, float]]
    Tax_Rate: Optional[Union[int, float]]
    Amount: Optional[Union[int, float]]

class InvoiceData(TypedDict):
    InvoiceHeader: InvoiceHeader
    InvoiceItems: List[InvoiceItem]

def empty_invoice() -> InvoiceData:
    return {
        "InvoiceHeader": {
            "Invoice_No": None,
            "Purchase_Order": None,
            "Date_of_Invoice": None,
            "Vendor_Name": None,
            "Vendor_Email": None,
            "Vendor_GSTIN": None,
            "Buyer_Name": None,
            "Buyer_Email": None,
            "Buyer_GSTIN": None,
            "Currency": None,
            "Payment_Terms": None,
            "Total_Amount_Before_Tax": None,
            "Tax": None,
            "Total_Amount_After_Tax": None,
            "Due_Amount": None
        },
        "InvoiceItems": []
    }

def parse_invoice_text(ocr_text: str) -> dict:
    if not ocr_text or not ocr_text.strip():
        logger.warning("No OCR text found.")
        return empty_invoice()

    if not client:
        logger.error("Groq API key not configured.")
        return empty_invoice()

    system_prompt = """
You are an enterprise-grade invoice extraction and normalization engine.

Your task is to extract structured information from ANY invoice PDF, scanned image, OCR text, or multi-page invoice document and return exactly one valid JSON object.

The output JSON is intended for direct integration with ERP systems such as SAP, Oracle, Microsoft Dynamics, and custom accounting platforms using a Header-Item data model.

Invoices may vary significantly in:
* Layout and formatting
* Language and region
* Currency and tax structure
* Number of pages
* Vendor-specific templates
* Presence or absence of labels
* Table formats and column names

You must adapt to these variations while preserving a consistent output schema.

## Output Requirements
1. Return exactly one valid JSON object.
2. Do not include markdown, code fences, comments, explanations, or additional text.
3. The response must be parseable using Python `json.loads()`.
4. Do not rename keys or create additional fields.
5. Preserve the exact key order defined in the schema.
6. Use `null` for missing, unreadable, ambiguous, or low-confidence values.
7. Never hallucinate or guess values.
8. Use an empty array `[]` if no line items are found.
9. `InvoiceItems` must always be an array, even when only one item exists.
10. All numeric fields must be returned as numbers, not strings.
11. Remove currency symbols, percentage signs, commas, and extra whitespace from numeric values.
12. Preserve leading zeros in identifiers.
13. Trim leading and trailing whitespace from all string values.
14. Preserve the original invoice values whenever possible.

## Document Understanding Rules
1. Process all pages of the document.
2. Merge information found across multiple pages.
3. Ignore duplicate headers and footers.
4. Ignore watermarks unless they contain relevant invoice information.
5. Ignore terms and conditions unless they contain payment terms.
6. Ignore logos and decorative content.
7. If multiple invoices exist in one document, extract only the first complete invoice.
8. Use contextual understanding when labels differ.

Examples:
* Invoice Number = Invoice No, Bill No, Document No, Reference No
* Purchase Order = PO Number, Order Number, Customer PO
* Vendor = Supplier, Seller, Merchant, Issuer
* Buyer = Customer, Bill To, Client, Recipient
* Date = Invoice Date, Issue Date, Billing Date
* Total = Grand Total, Amount Due, Invoice Total

## Date Rules
1. Convert all dates to ISO 8601 format: `YYYY-MM-DD`.
2. Infer date formats from context.

Examples:
* `25/01/2016` → `2016-01-25`
* `January 25, 2016` → `2016-01-25`
* `25-Jan-2016` → `2016-01-25`

3. If multiple dates are present Priority order: Invoice Date, Issue Date, Billing Date, Document Date
4. Do not use Due Date as the invoice date.

## Currency Rules
1. Extract currency from explicit currency codes whenever available. (e.g. INR, USD, EUR, GBP, JPY, AUD, CAD)
2. If no currency code exists, infer currency from symbols. (e.g. ₹ → INR, $ → USD, € → EUR, £ → GBP, ¥ → JPY)
3. If the symbol is ambiguous, use vendor country information when available.
4. If currency cannot be determined confidently, return `null`.

## Tax Rules
1. Aggregate all document-level taxes into the `Tax` field.
2. If item-level tax percentages are explicitly available, populate `Tax_Rate`.
3. Do not calculate tax rates unless explicitly allowed.
4. If tax information is unavailable, return `null`.

## Item Extraction Rules
1. Detect item tables dynamically.
2. Each line item must become one object in `InvoiceItems`.
3. Preserve row order.
4. `Line_No` must start at `1` and increment sequentially.
5. If multiple description lines belong to the same item, merge them into a single string.
6. If quantity is missing but the item appears once, return `null`.
7. Preserve units exactly as shown.

## Validation Rules
1. Ensure: Total_Amount_After_Tax ≈ Total_Amount_Before_Tax + Tax
2. Ensure: sum(InvoiceItems[].Amount) ≈ Total_Amount_Before_Tax
3. Minor rounding differences of ±1 unit are acceptable.
4. If totals conflict, prioritize values explicitly labeled: Grand Total, Amount Due, Invoice Total, Total Payable
5. Preserve values exactly as displayed even if they appear inconsistent.

## Output Schema
{
  "InvoiceHeader": {
    "Invoice_No": "string | null",
    "Purchase_Order": "string | null",
    "Date_of_Invoice": "YYYY-MM-DD | null",
    "Vendor_Name": "string | null",
    "Vendor_Email": "string | null",
    "Vendor_GSTIN": "string | null",
    "Buyer_Name": "string | null",
    "Buyer_Email": "string | null",
    "Buyer_GSTIN": "string | null",
    "Currency": "string | null",
    "Payment_Terms": "string | null",
    "Total_Amount_Before_Tax": "number | null",
    "Tax": "number | null",
    "Total_Amount_After_Tax": "number | null",
    "Due_Amount": "number | null"
  },
  "InvoiceItems": [
    {
      "Line_No": "integer",
      "Item_Code": "string | null",
      "Description": "string | null",
      "HSN_SAC_Code": "string | null",
      "Quantity": "number | null",
      "Unit_Of_Measure": "string | null",
      "Unit_Price": "number | null",
      "Tax_Rate": "number | null",
      "Amount": "number | null"
    }
  ]
}

## Example Constraints
* Return only the JSON object.
* Never output explanatory text.
* Never wrap the JSON in markdown.
* Never omit schema fields.
* Always use `null` instead of empty strings.
* Always return `InvoiceHeader` and `InvoiceItems`.
* The output must remain identical regardless of invoice layout.
"""

    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": f"Extract the invoice data from the following OCR text:\n\n{ocr_text}"
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
        
        # Ensure correct root structure is present
        if "InvoiceHeader" not in result:
            result["InvoiceHeader"] = empty_invoice()["InvoiceHeader"]
        if "InvoiceItems" not in result:
            result["InvoiceItems"] = []

        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Groq JSON response: {e}\nRaw: {content}")
        return empty_invoice()
    except Exception as e:
        logger.error(f"Groq API Error: {e}")
        raise ValueError(f"Groq API Error: {e}")