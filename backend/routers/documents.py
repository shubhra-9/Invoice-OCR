from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from db.database import get_db
import db.models as models
from auth.security import get_current_user
from services.s3_storage import storage
import logging

from services.ocr import extract_text_from_pdf
from services.extractor import parse_invoice_text

import json

logger = logging.getLogger(__name__)

router = APIRouter()



def process_document_background(document_id: str):
    db: Session = next(get_db())
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        logger.error(f"Document {document_id} not found.")
        return

    try:
        doc.status = models.DocumentStatus.processing
        db.commit()

        # For windows compat, use os.path or tempfile
        import tempfile
        import os
        temp_dir = tempfile.gettempdir()
        temp_file_path = f"{temp_dir}/{doc.storage_key}"

        os.makedirs(os.path.dirname(temp_file_path), exist_ok=True)
        
        try:
            logger.info(f"Downloading {doc.storage_key} to {temp_file_path}")
            storage.download_to_file(doc.storage_key, temp_file_path)

            # OCR Extraction
            logger.info(f"Running OCR for document {document_id}...")
            ocr_text = extract_text_from_pdf(temp_file_path)

            # Structured Data Extraction
            logger.info("Parsing invoice fields...")
            extracted_data = parse_invoice_text(ocr_text)

            # Check new schema or fallback to old schema structure
            header = extracted_data.get("InvoiceHeader", extracted_data)
            is_valid = header.get("Invoice_No") or header.get("Purchase_Order")
            
            if not is_valid:
                doc.status = models.DocumentStatus.failed
                log = models.ProcessingLog(document_id=doc.id, status=models.DocumentStatus.failed, error_message="Missing Invoice No and PO")
                db.add(log)
            else:
                doc.status = models.DocumentStatus.completed
                existing_ext = db.query(models.ExtractionResult).filter_by(document_id=doc.id).first()
                if existing_ext:
                    existing_ext.extracted_data = extracted_data
                else:
                    ext = models.ExtractionResult(document_id=doc.id, extracted_data=extracted_data)
                    db.add(ext)

        finally:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                    logger.info(f"Cleaned up temp file: {temp_file_path}")
                except Exception as cleanup_err:
                    logger.error(f"Failed to clean up temp file {temp_file_path}: {cleanup_err}")

    except Exception as e:
        logger.exception("Error processing document")
        doc.status = models.DocumentStatus.failed
        log = models.ProcessingLog(document_id=doc.id, status=models.DocumentStatus.failed, error_message=str(e))
        db.add(log)
    finally:
        db.commit()


from fastapi import File, UploadFile, Form

@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    repo_id: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = db.query(models.Repository).filter(
        models.Repository.id == repo_id,
        models.Repository.user_id == current_user.id
    ).first()
    
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # Read file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    new_doc = models.Document(
        repository_id=repo.id,
        original_filename=file.filename,
        mime_type=file.content_type or "application/pdf",
        file_size=file_size,
        status=models.DocumentStatus.uploaded
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    storage_key = f"uploads/{current_user.id}/{new_doc.id}.pdf"
    new_doc.storage_key = storage_key
    db.commit()

    try:
        storage.upload_fileobj(file.file, storage_key, content_type=file.content_type or "application/pdf")
    except Exception as e:
        logger.error(f"Failed to upload to S3: {e}")
        db.delete(new_doc)
        db.commit()
        raise HTTPException(status_code=500, detail="Failed to upload file to storage backend")

    return {
        "success": True, 
        "message": "Upload complete, ready for processing.",
        "document_id": str(new_doc.id),
        "storage_key": storage_key
    }

@router.post("/invoices/{document_id}/process")
def process_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(models.Document).join(models.Repository).filter(
        models.Document.id == document_id,
        models.Repository.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.status == models.DocumentStatus.processing:
        raise HTTPException(status_code=400, detail="Document is already processing")

    doc.status = models.DocumentStatus.processing
    db.commit()

    background_tasks.add_task(process_document_background, str(doc.id))
    return {"success": True, "message": "Processing started"}

@router.get("/invoices")
def get_documents(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Backward compatible formatting
    docs = db.query(models.Document).join(models.Repository).filter(
        models.Repository.user_id == current_user.id
    ).order_by(models.Document.created_at.desc()).all()

    results = []
    for doc in docs:
        extracted = doc.extraction_result.extracted_data if doc.extraction_result else {}
        status_map = {
            models.DocumentStatus.pending_upload: "Pending",
            models.DocumentStatus.uploaded: "Pending",
            models.DocumentStatus.queued: "Pending",
            models.DocumentStatus.processing: "Processing",
            models.DocumentStatus.completed: "Processed",
            models.DocumentStatus.failed: "Failed"
        }
        results.append({
            "id": str(doc.id),
            "original_filename": doc.original_filename,
            "unique_filename": doc.storage_key or "",
            "status": status_map.get(doc.status, "Pending"),
            "extracted_data": extracted,
            "created_at": doc.created_at,
            "repo_id": str(doc.repository_id),
            "file_size": doc.file_size
        })
    return {"success": True, "data": results}

@router.delete("/invoices/{document_id}")
def delete_document(
    document_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(models.Document).join(models.Repository).filter(
        models.Document.id == document_id,
        models.Repository.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.storage_key:
        storage.delete_object(doc.storage_key)

    db.delete(doc)
    db.commit()
    return {"success": True}
