from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import requests as req_lib

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
    except req_lib.exceptions.ConnectionError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Redmine 서버에 연결할 수 없습니다. URL을 확인하거나 서버가 외부에서 접근 가능한지 확인하세요.")
    except req_lib.exceptions.Timeout:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="연결 시간 초과. Redmine 서버가 응답하지 않습니다.")
    except req_lib.exceptions.HTTPError as e:
        code = e.response.status_code if e.response else "?"
        if code == 401:
            detail = "API 키가 올바르지 않습니다."
        elif code == 403:
            detail = "접근 권한이 없습니다. API 키 권한을 확인하세요."
        elif code == 404:
            detail = "Redmine URL이 올바르지 않습니다."
        else:
            detail = f"Redmine 응답 오류: HTTP {code}"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
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
    except req_lib.exceptions.ConnectionError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Redmine 서버에 연결할 수 없습니다.")
    except req_lib.exceptions.Timeout:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="연결 시간 초과.")
    except req_lib.exceptions.HTTPError as e:
        code = e.response.status_code if e.response else "?"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Redmine 응답 오류: HTTP {code}")
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
