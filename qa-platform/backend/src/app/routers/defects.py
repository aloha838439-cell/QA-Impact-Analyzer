from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from src.app.database import get_db
from src.app.auth import get_current_user
from src.models.user import User
from src.services.defect_service import DefectService

router = APIRouter()


class DefectCreateRequest(BaseModel):
    title: str
    description: str
    severity: str = "Medium"
    module: str
    status: str = "Open"
    reporter: Optional[str] = None
    related_features: Optional[List[str]] = []


class DefectResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    module: str
    status: str
    reporter: Optional[str]
    related_features: List[str]
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_defects_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload defects from a CSV file and compute embeddings."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are accepted",
        )

    content = await file.read()
    service = DefectService(db)

    try:
        result = await service.ingest_csv(content, reporter_id=current_user.id)
        return {
            "message": f"Successfully uploaded {result['created']} defects",
            "created": result["created"],
            "skipped": result["skipped"],
            "errors": result["errors"],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error processing CSV: {str(e)}",
        )


@router.get("", response_model=List[DefectResponse])
async def list_defects(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    module: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all defects with optional filtering."""
    service = DefectService(db)
    defects = await service.get_defects(
        skip=skip,
        limit=limit,
        module=module,
        severity=severity,
        search=search,
    )
    return [d.to_dict() for d in defects]


@router.get("/stats")
async def get_defect_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get defect statistics."""
    service = DefectService(db)
    return await service.get_stats()


@router.get("/{defect_id}", response_model=DefectResponse)
async def get_defect(
    defect_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific defect by ID."""
    service = DefectService(db)
    defect = await service.get_defect_by_id(defect_id)

    if not defect:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Defect with id {defect_id} not found",
        )

    return defect.to_dict()


@router.post("", response_model=DefectResponse, status_code=status.HTTP_201_CREATED)
async def create_defect(
    request: DefectCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a single defect manually."""
    service = DefectService(db)
    defect = await service.create_defect(
        title=request.title,
        description=request.description,
        severity=request.severity,
        module=request.module,
        status=request.status,
        reporter=request.reporter or current_user.username,
        reporter_id=current_user.id,
        related_features=request.related_features or [],
    )
    return defect.to_dict()


@router.post("/seed")
async def seed_defects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Seed database with sample defects for development."""
    from src.utils.seed_data import SEED_DEFECTS
    service = DefectService(db)

    created = 0
    for defect_data in SEED_DEFECTS:
        try:
            await service.create_defect(
                title=defect_data["title"],
                description=defect_data["description"],
                severity=defect_data["severity"],
                module=defect_data["module"],
                status=defect_data.get("status", "Open"),
                reporter=defect_data.get("reporter", "Seed Script"),
                related_features=defect_data.get("related_features", []),
            )
            created += 1
        except Exception:
            pass

    return {"message": f"Seeded {created} defects", "total": len(SEED_DEFECTS)}
