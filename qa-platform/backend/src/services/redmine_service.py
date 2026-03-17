import json
import ssl
import urllib.request
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

# SSL 검증 무시 컨텍스트 (사내 Redmine 자체 서명 인증서 대응)
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE


def _get(url: str, api_key: str) -> dict:
    req = urllib.request.Request(url, headers={"X-Redmine-API-Key": api_key})
    with urllib.request.urlopen(req, context=_ssl_ctx, timeout=15) as resp:
        return json.loads(resp.read().decode())


def fetch_projects(base_url: str, api_key: str) -> list[dict]:
    data = _get(f"{base_url.rstrip('/')}/projects.json?limit=100", api_key)
    return [{"id": p["identifier"], "name": p["name"]} for p in data.get("projects", [])]


def fetch_redmine_issues(
    base_url: str,
    api_key: str,
    project_id: Optional[str] = None,
    limit: int = 100,
    status_id: str = "open",
) -> list[dict]:
    base = base_url.rstrip("/")
    qs = f"limit={limit}&status_id={status_id}"
    if project_id:
        qs += f"&project_id={project_id}"
    data = _get(f"{base}/issues.json?{qs}", api_key)
    return [_convert(i) for i in data.get("issues", [])]


def _convert(issue: dict) -> dict:
    module = (
        issue.get("category", {}).get("name")
        or issue.get("tracker", {}).get("name")
        or "General"
    )
    return {
        "title": issue.get("subject", ""),
        "description": issue.get("description") or issue.get("subject", ""),
        "severity": PRIORITY_MAP.get(issue.get("priority", {}).get("name", "Normal"), "Medium"),
        "module": module,
        "status": STATUS_MAP.get(issue.get("status", {}).get("name", "New"), "Open"),
        "reporter": issue.get("author", {}).get("name", ""),
        "related_features": [],
    }
