from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from db.database import get_db
import db.models as models
from auth.security import get_current_user
from services.s3_storage import storage

router = APIRouter()

# ─── Schemas ──────────────────────────────────────────────────────────────────

class RepoCreate(BaseModel):
    name: str
    description: Optional[str] = None

class DocumentAssign(BaseModel):
    document_id: str

# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/")
def list_repos(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repos = (
        db.query(models.Repository)
        .filter(models.Repository.user_id == current_user.id)
        .order_by(models.Repository.created_at.desc())
        .all()
    )
    
    # Custom serialization since document_count is dynamic
    results = []
    for r in repos:
        results.append({
            "id": str(r.id),
            "name": r.name,
            "description": r.description,
            "created_at": r.created_at,
            "invoice_count": len(r.documents) # Keep name invoice_count for frontend compat if needed
        })
    return {"success": True, "data": results}


@router.post("/")
def create_repo(
    body: RepoCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(models.Repository)
        .filter(
            models.Repository.user_id == current_user.id,
            models.Repository.name == body.name,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="A repository with this name already exists.")

    repo = models.Repository(
        name=body.name,
        description=body.description,
        user_id=current_user.id,
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)
    
    return {"success": True, "data": {
        "id": str(repo.id),
        "name": repo.name,
        "description": repo.description,
        "created_at": repo.created_at,
        "invoice_count": 0
    }}


@router.delete("/{repo_id}")
def delete_repo(
    repo_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = (
        db.query(models.Repository)
        .filter(
            models.Repository.id == repo_id,
            models.Repository.user_id == current_user.id,
        )
        .first()
    )
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found.")

    db.delete(repo)
    db.commit()
    return {"success": True}


@router.get("/{repo_id}/invoices")
def get_repo_documents(
    repo_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = (
        db.query(models.Repository)
        .filter(
            models.Repository.id == repo_id,
            models.Repository.user_id == current_user.id,
        )
        .first()
    )
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found.")

    results = []
    for doc in repo.documents:
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
        })

    return {"success": True, "data": results}

@router.post("/{repo_id}/invoices")
def assign_invoice_to_repo(
    repo_id: str,
    body: DocumentAssign,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = db.query(models.Repository).filter(
        models.Repository.id == repo_id,
        models.Repository.user_id == current_user.id
    ).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    doc = db.query(models.Document).filter(
        models.Document.id == body.document_id,
        models.Document.repository.has(user_id=current_user.id)
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.repository_id = repo.id
    db.commit()
    return {"success": True}

@router.delete("/{repo_id}/invoices/{document_id}")
def remove_invoice_from_repo(
    repo_id: str,
    document_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = db.query(models.Repository).filter(
        models.Repository.id == repo_id,
        models.Repository.user_id == current_user.id
    ).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    doc = db.query(models.Document).filter(
        models.Document.id == document_id,
        models.Document.repository_id == repo.id
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found in this repository")

    # If it's the "Unassigned" default repo logic... wait, every document MUST belong to a repository.
    # If the user clicks "Remove from repository", should it be assigned to a default repo, or deleted?
    # Usually "Remove from repository" means move to a default "All Invoices" repo, or delete it entirely.
    # In this app, documents are hard-linked to a repository_id.
    # If we want to "remove" it, maybe we delete it entirely or just keep it?
    if doc.storage_key:
        storage.delete_object(doc.storage_key)

    db.delete(doc)
    db.commit()
    return {"success": True}
