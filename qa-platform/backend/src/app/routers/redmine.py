from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import urllib.error

from src.app.database import get_db
from src.app.auth import get_current_user
from src.models.user import User
from src.services.redmine_service import fetch_projects, fetch_redmine_issues
from src.services.defect_service import DefectService

router = APIRouter()


class RedmineConnectRequest(BaseModel):
    base_url: str
    api_key: str


class RedmineImportRequest(BaseModel):
    base_url: str
    api_key: str
    project_id: Optional[str] = None
    limit: int = 100
    status_id: str = "open"


@router.post("/test")
def test_redmine_connection(
    body: RedmineConnectRequest,
    current_user: User = Depends(get_current_user),
):
    """Redmine 연결 테스트 — 프로젝트 목록 반환"""
    try:
        projects = fetch_projects(body.base_url, body.api_key)
        return {"ok": True, "projects": projects}
    except urllib.error.HTTPError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Redmine 응답 오류: {e.code}")
    except urllib.error.URLError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"연결 실패: {e.reason}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"연결 실패: {str(e)}")


@router.post("/import")
async def import_from_redmine(
    body: RedmineImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Redmine 이슈를 결함 데이터로 가져오기"""
    try:
        issues = fetch_redmine_issues(
            base_url=body.base_url,
            api_key=body.api_key,
            project_id=body.project_id or None,
            limit=body.limit,
            status_id=body.status_id,
        )
    except urllib.error.HTTPError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Redmine 응답 오류: {e.code}")
    except urllib.error.URLError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"연결 실패: {e.reason}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"가져오기 실패: {str(e)}")

    service = DefectService(db)
    created = skipped = 0
    for issue in issues:
        try:
            await service.create_defect(
                title=issue["title"],
                description=issue["description"],
                severity=issue["severity"],
                module=issue["module"],
                status=issue["status"],
                reporter=issue["reporter"],
                reporter_id=current_user.id,
                related_features=[],
            )
            created += 1
        except Exception:
            skipped += 1

    return {
        "message": f"Redmine에서 {created}건 가져오기 완료",
        "created": created,
        "skipped": skipped,
        "total_fetched": len(issues),
    }
