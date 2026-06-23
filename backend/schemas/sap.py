from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class InvoiceItem(BaseModel):
    Line_No: int
    Item_Code: Optional[str] = None
    Description: Optional[str] = None
    HSN_SAC_Code: Optional[str] = None
    Quantity: Optional[float] = 0.0
    Unit_Of_Measure: Optional[str] = None
    Unit_Price: Optional[float] = 0.0
    Tax_Rate: Optional[float] = 0.0
    Amount: Optional[float] = 0.0

class InvoiceHeader(BaseModel):
    Invoice_No: Optional[str] = None
    Purchase_Order: Optional[str] = None
    Date_of_Invoice: Optional[date] = None
    
    Vendor_Name: Optional[str] = None
    Vendor_Email: Optional[str] = None
    Vendor_GSTIN: Optional[str] = None
    
    Buyer_Name: Optional[str] = None
    Buyer_Email: Optional[str] = None
    Buyer_GSTIN: Optional[str] = None
    
    Currency: Optional[str] = "INR"
    Payment_Terms: Optional[str] = None
    
    Total_Amount_Before_Tax: Optional[float] = 0.0
    Tax: Optional[float] = 0.0
    Total_Amount_After_Tax: Optional[float] = 0.0
    Due_Amount: Optional[float] = 0.0

class SAPInvoicePayload(BaseModel):
    InvoiceHeader: InvoiceHeader
    InvoiceItems: List[InvoiceItem] = Field(default_factory=list)
