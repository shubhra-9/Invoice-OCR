from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from db.database import get_db
from services.sap_service import SAPInvoiceService

router = APIRouter(prefix="/api/invoices", tags=["sap"])
logger = logging.getLogger(__name__)

@router.post("/{invoice_id}/sync-sap")
async def sync_invoice_to_sap(invoice_id: str, db: Session = Depends(get_db)):
    """
    Synchronizes the extracted invoice JSON data to SAP.
    """
    try:
        result = await SAPInvoiceService.sync_invoice_to_sap(invoice_id, db)
        return result
    except ValueError as e:
        logger.warning(f"Validation error syncing to SAP: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error syncing to SAP: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
