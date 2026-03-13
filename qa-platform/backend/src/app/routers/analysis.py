from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from src.app.database import get_db
from src.app.auth import get_current_user
from src.models.user import User
from src.services.similarity_service import SimilarityService
from src.services.impact_service import ImpactService
from src.services.test_case_service import TestCaseService

router = APIRouter()


class SimilarDefectsRequest(BaseModel):
    query: str
    module: Optional[str] = None
    top_k: int = 10


class ImpactAnalysisRequest(BaseModel):
    query: str
    module: Optional[str] = None
    similar_defects: Optional[List[dict]] = None


class TestCaseRequest(BaseModel):
    query: str
    module: Optional[str] = None
    similar_defects: Optional[List[dict]] = None
    num_cases: int = 5


class SimilarDefectResult(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    module: str
    status: str
    reporter: Optional[str]
    related_features: List[str]
    similarity_score: float
    created_at: Optional[str]


class ImpactResult(BaseModel):
    impact_score: float
    risk_level: str
    affected_areas: List[str]
    potential_side_effects: List[str]
    severity_distribution: dict
    recommendation: str


class TestCaseResult(BaseModel):
    id: Optional[int]
    title: str
    description: str
    steps: List[str]
    expected_result: str
    priority: str
    test_type: str
    module: Optional[str]
    tags: List[str]


@router.post("/similar-defects", response_model=List[SimilarDefectResult])
async def find_similar_defects(
    request: SimilarDefectsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Find defects similar to the given query using semantic similarity."""
    if not request.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty",
        )

    service = SimilarityService(db)
    results = await service.find_similar_defects(
        query=request.query,
        module_filter=request.module,
        top_k=min(request.top_k, 20),
    )
    return results


@router.post("/impact", response_model=ImpactResult)
async def analyze_impact(
    request: ImpactAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze the potential impact of a change based on similar historical defects."""
    if not request.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty",
        )

    # If similar defects not provided, fetch them
    similar_defects = request.similar_defects
    if not similar_defects:
        similarity_service = SimilarityService(db)
        similar_defects = await similarity_service.find_similar_defects(
            query=request.query,
            module_filter=request.module,
            top_k=10,
        )

    impact_service = ImpactService(db)
    result = await impact_service.analyze_impact(
        query=request.query,
        module=request.module,
        similar_defects=similar_defects,
        user_id=current_user.id,
    )
    return result


@router.post("/test-cases", response_model=List[TestCaseResult])
async def generate_test_cases(
    request: TestCaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate test cases based on the change description and similar defects."""
    if not request.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty",
        )

    # If similar defects not provided, fetch them
    similar_defects = request.similar_defects
    if not similar_defects:
        similarity_service = SimilarityService(db)
        similar_defects = await similarity_service.find_similar_defects(
            query=request.query,
            module_filter=request.module,
            top_k=5,
        )

    test_case_service = TestCaseService(db)
    test_cases = await test_case_service.generate_test_cases(
        query=request.query,
        module=request.module,
        similar_defects=similar_defects,
        num_cases=min(request.num_cases, 10),
        user_id=current_user.id,
    )
    return test_cases


@router.get("/history")
async def get_analysis_history(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recent analysis history for the current user."""
    from src.models.impact_analysis import ImpactAnalysis
    analyses = (
        db.query(ImpactAnalysis)
        .filter(ImpactAnalysis.user_id == current_user.id)
        .order_by(ImpactAnalysis.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [a.to_dict() for a in analyses]
