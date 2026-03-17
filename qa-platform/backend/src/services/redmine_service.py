import json
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning
from typing import Optional

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

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


def _get(url: str, api_key: str) -> dict:
    resp = requests.get(
        url,
        headers={"X-Redmine-API-Key": api_key},
        verify=False,
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()


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
    params = f"limit={limit}&status_id={status_id}"
    if project_id:
        params += f"&project_id={project_id}"
    data = _get(f"{base}/issues.json?{params}", api_key)
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
