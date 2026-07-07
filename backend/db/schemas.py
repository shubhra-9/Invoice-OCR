from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from db.models import DocumentStatus

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
    model_config = ConfigDict(from_attributes=True)

