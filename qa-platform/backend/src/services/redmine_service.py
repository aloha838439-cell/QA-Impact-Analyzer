import httpx
from typing import Optional


PRIORITY_MAP = {
    "Immediate": "Critical",
    "Urgent": "Critical",
    "High": "High",
    "Normal": "Medium",
    "Low": "Low",
}

STATUS_MAP = {
    "New": "Open",
    "In Progress": "Open",
    "Resolved": "Resolved",
    "Feedback": "Open",
    "Closed": "Closed",
    "Rejected": "Closed",
}


def _map_priority(priority_name: str) -> str:
    return PRIORITY_MAP.get(priority_name, "Medium")


def _map_status(status_name: str) -> str:
    return STATUS_MAP.get(status_name, "Open")


async def fetch_redmine_issues(
    base_url: str,
    api_key: str,
    project_id: Optional[str] = None,
    limit: int = 100,
    status_id: str = "open",
) -> list[dict]:
    """Redmine REST API에서 이슈를 가져와 결함 포맷으로 변환"""
    base_url = base_url.rstrip("/")
    headers = {"X-Redmine-API-Key": api_key}
    params: dict = {"limit": limit, "status_id": status_id}
    if project_id:
        params["project_id"] = project_id

    async with httpx.AsyncClient(timeout=15.0, verify=False) as client:
        response = await client.get(f"{base_url}/issues.json", headers=headers, params=params)
        response.raise_for_status()

    issues = response.json().get("issues", [])
    return [_convert(issue) for issue in issues]


def _convert(issue: dict) -> dict:
    module = (
        issue.get("category", {}).get("name")
        or issue.get("tracker", {}).get("name")
        or "General"
    )
    return {
        "title": issue.get("subject", ""),
        "description": issue.get("description") or issue.get("subject", ""),
        "severity": _map_priority(issue.get("priority", {}).get("name", "Normal")),
        "module": module,
        "status": _map_status(issue.get("status", {}).get("name", "New")),
        "reporter": issue.get("author", {}).get("name", ""),
        "related_features": [],
        "redmine_id": issue.get("id"),
    }
