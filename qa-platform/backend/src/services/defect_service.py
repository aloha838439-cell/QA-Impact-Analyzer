from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import pandas as pd
import io
import logging
import ast

from src.models.defect import Defect
from src.services.similarity_service import SimilarityService

logger = logging.getLogger(__name__)


class DefectService:
    """Service for managing defects including CRUD operations and CSV ingestion."""

    def __init__(self, db: Session):
        self.db = db
        self.similarity_service = SimilarityService(db)

    async def create_defect(
        self,
        title: str,
        description: str,
        severity: str = "Medium",
        module: str = "",
        status: str = "Open",
        reporter: str = "",
        reporter_id: Optional[int] = None,
        related_features: Optional[List[str]] = None,
    ) -> Defect:
        """Create a single defect and compute its embedding."""
        defect = Defect(
            title=title,
            description=description,
            severity=severity,
            module=module,
            status=status,
            reporter=reporter,
            reporter_id=reporter_id,
            related_features=related_features or [],
        )
        self.db.add(defect)
        self.db.commit()
        self.db.refresh(defect)

        # Compute and store embedding
        await self.similarity_service.compute_and_store_embedding(defect)

        return defect

    async def get_defects(
        self,
        skip: int = 0,
        limit: int = 50,
        module: Optional[str] = None,
        severity: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Defect]:
        """Retrieve defects with optional filtering."""
        query = self.db.query(Defect)

        if module:
            query = query.filter(Defect.module.ilike(f"%{module}%"))

        if severity:
            query = query.filter(Defect.severity == severity)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Defect.title.ilike(search_term)) | (Defect.description.ilike(search_term))
            )

        return query.order_by(Defect.created_at.desc()).offset(skip).limit(limit).all()

    async def get_defect_by_id(self, defect_id: int) -> Optional[Defect]:
        """Get a defect by its ID."""
        return self.db.query(Defect).filter(Defect.id == defect_id).first()

    async def ingest_csv(self, content: bytes, reporter_id: Optional[int] = None) -> Dict[str, Any]:
        """Parse and ingest defects from CSV content.

        Expected CSV columns: title, description, severity, module, status, reporter, related_features
        """
        result = {"created": 0, "skipped": 0, "errors": []}

        try:
            df = pd.read_csv(io.BytesIO(content))
        except Exception as e:
            raise ValueError(f"Failed to parse CSV: {e}")

        # Normalize column names
        df.columns = [col.strip().lower() for col in df.columns]

        required_columns = {"title", "description"}
        missing = required_columns - set(df.columns)
        if missing:
            raise ValueError(f"Missing required columns: {missing}")

        for idx, row in df.iterrows():
            try:
                title = str(row.get("title", "")).strip()
                description = str(row.get("description", "")).strip()

                if not title or not description:
                    result["skipped"] += 1
                    continue

                # Check for duplicate title
                existing = self.db.query(Defect).filter(Defect.title == title).first()
                if existing:
                    result["skipped"] += 1
                    continue

                # Parse related_features
                related_features = []
                rf_raw = row.get("related_features", "[]")
                if rf_raw and str(rf_raw) != "nan":
                    try:
                        parsed = ast.literal_eval(str(rf_raw))
                        if isinstance(parsed, list):
                            related_features = [str(f) for f in parsed]
                        elif isinstance(parsed, str):
                            related_features = [parsed]
                    except Exception:
                        # Try splitting by comma
                        related_features = [f.strip() for f in str(rf_raw).split(",") if f.strip()]

                severity = str(row.get("severity", "Medium")).strip()
                if severity not in ("Critical", "High", "Medium", "Low"):
                    severity = "Medium"

                await self.create_defect(
                    title=title,
                    description=description,
                    severity=severity,
                    module=str(row.get("module", "General")).strip(),
                    status=str(row.get("status", "Open")).strip(),
                    reporter=str(row.get("reporter", "")).strip(),
                    reporter_id=reporter_id,
                    related_features=related_features,
                )
                result["created"] += 1

            except Exception as e:
                logger.error(f"Error processing row {idx}: {e}")
                result["errors"].append(f"Row {idx + 1}: {str(e)}")

        return result

    async def get_stats(self) -> Dict[str, Any]:
        """Get defect statistics."""
        total = self.db.query(Defect).count()
        with_embeddings = self.db.query(Defect).filter(Defect.embedding.isnot(None)).count()

        severity_counts = {}
        for severity in ["Critical", "High", "Medium", "Low"]:
            count = self.db.query(Defect).filter(Defect.severity == severity).count()
            severity_counts[severity] = count

        status_counts = {}
        for status in ["Open", "In Progress", "Resolved", "Closed"]:
            count = self.db.query(Defect).filter(Defect.status == status).count()
            status_counts[status] = count

        # Module distribution
        from sqlalchemy import func
        module_rows = (
            self.db.query(Defect.module, func.count(Defect.id).label("count"))
            .group_by(Defect.module)
            .order_by(func.count(Defect.id).desc())
            .limit(10)
            .all()
        )
        module_distribution = {row.module: row.count for row in module_rows}

        return {
            "total": total,
            "with_embeddings": with_embeddings,
            "severity_distribution": severity_counts,
            "status_distribution": status_counts,
            "module_distribution": module_distribution,
        }
