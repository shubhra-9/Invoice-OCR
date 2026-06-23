from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from db.models import DocumentStatus, SAPSyncStatus

class UserResponse(BaseModel):
    id: UUID
    clerk_id: str
    email: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class RepositoryResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    created_at: datetime
    document_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class ExtractionResultResponse(BaseModel):
    id: UUID
    extracted_data: Optional[Dict[str, Any]]
    confidence_score: Optional[float]
    processing_time_ms: Optional[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentResponse(BaseModel):
    id: UUID
    repository_id: UUID
    original_filename: str
    status: DocumentStatus
    mime_type: str
    file_size: Optional[int]
    created_at: datetime
    extraction: Optional[ExtractionResultResponse] = None

    # SAP Tracking
    sap_sync_status: Optional[SAPSyncStatus] = None
    sap_document_no: Optional[str] = None
    sap_synced_at: Optional[datetime] = None
    sap_error_message: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

