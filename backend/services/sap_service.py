import httpx
from datetime import datetime, timezone
from sqlalchemy.orm import Session
import logging

import config
from db.models import Document, SAPSyncStatus
from schemas.sap import SAPInvoicePayload
from services.oauth_service import SAPOAuthService
from services.csrf_service import SAPCSRFService

logger = logging.getLogger(__name__)

oauth_service = SAPOAuthService()
csrf_service = SAPCSRFService()

class SAPInvoiceService:
    @staticmethod
    async def sync_invoice_to_sap(invoice_id: str, db: Session) -> dict:
        """
        Synchronizes an invoice to SAP.
        """
        # 1. Fetch document and extraction result
        doc = db.query(Document).filter(Document.id == invoice_id).first()
        if not doc:
            raise ValueError(f"Invoice {invoice_id} not found.")

        if not doc.extraction_result or not doc.extraction_result.extracted_data:
            raise ValueError(f"Invoice {invoice_id} has no extracted data.")

        # Update status to PENDING
        doc.sap_sync_status = SAPSyncStatus.pending
        db.commit()

        try:
            # 2. Validate payload using Pydantic schema
            payload = SAPInvoicePayload(**doc.extraction_result.extracted_data)
            payload_dict = payload.model_dump(mode="json", exclude_none=True)

            # 3. Get OAuth Token
            access_token = await oauth_service.get_access_token()

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }

            cookies = None
            if config.SAP_REQUIRE_CSRF:
                # 4. Fetch CSRF token
                csrf_token, cookies = await csrf_service.fetch_csrf_token(config.SAP_ODATA_URL, access_token)
                headers["x-csrf-token"] = csrf_token

            # 5. Send to SAP
            async with httpx.AsyncClient(cookies=cookies) as client:
                response = await client.post(
                    config.SAP_ODATA_URL, 
                    json=payload_dict, 
                    headers=headers,
                    timeout=30.0 # 30s timeout for SAP requests
                )

                if response.status_code >= 400:
                    error_msg = f"SAP Error {response.status_code}: {response.text}"
                    logger.error(error_msg)
                    raise Exception(error_msg)

                sap_response_data = response.json()
                
                # Assume SAP returns document number in 'd' -> 'Invoice_No' or similar based on OData conventions
                # Adjust based on exact SAP response
                d_node = sap_response_data.get("d", sap_response_data)
                sap_doc_no = d_node.get("Invoice_No") or d_node.get("DocumentNumber") or "UNKNOWN"

                # 6. Success: Update DB
                doc.sap_sync_status = SAPSyncStatus.success
                doc.sap_document_no = str(sap_doc_no)
                doc.sap_response = sap_response_data
                doc.sap_synced_at = datetime.now(timezone.utc)
                doc.sap_error_message = None
                db.commit()

                return {
                    "status": "success",
                    "sap_document_no": doc.sap_document_no,
                    "message": "Invoice successfully synced to SAP."
                }

        except Exception as e:
            # 7. Failure: Update DB
            doc.sap_sync_status = SAPSyncStatus.failed
            doc.sap_error_message = str(e)
            doc.sap_synced_at = datetime.now(timezone.utc)
            db.commit()
            
            logger.exception("Failed to sync invoice to SAP")
            raise Exception(f"Failed to sync to SAP: {str(e)}")
