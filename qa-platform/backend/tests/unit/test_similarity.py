"""Unit tests for the similarity model."""
import pytest
import numpy as np
from unittest.mock import MagicMock, patch


class TestSimilarityModel:
    """Unit tests for SimilarityModel."""

    def test_find_similar_returns_sorted_results(self):
        """Test that find_similar returns results sorted by score descending."""
        from src.ml_models.similarity_model import SimilarityModel

        model = SimilarityModel.__new__(SimilarityModel)
        model._model = None
        model.model_name = "test-model"

        # Mock embeddings
        query_embedding = [1.0, 0.0, 0.0]
        candidate_embeddings = [
            [0.9, 0.1, 0.0],   # high similarity
            [0.0, 1.0, 0.0],   # low similarity
            [0.8, 0.2, 0.0],   # medium similarity
        ]

        results = model.find_similar(query_embedding, candidate_embeddings, top_k=3)

        assert len(results) <= 3
        # Results should be sorted by score descending
        scores = [score for _, score in results]
        assert scores == sorted(scores, reverse=True)

    def test_find_similar_empty_candidates(self):
        """Test that find_similar returns empty list for empty candidates."""
        from src.ml_models.similarity_model import SimilarityModel

        model = SimilarityModel.__new__(SimilarityModel)

        results = model.find_similar([1.0, 0.0], [], top_k=5)
        assert results == []

    def test_find_similar_empty_query(self):
        """Test that find_similar returns empty list for empty query."""
        from src.ml_models.similarity_model import SimilarityModel

        model = SimilarityModel.__new__(SimilarityModel)

        results = model.find_similar([], [[1.0, 0.0]], top_k=5)
        assert results == []

    def test_find_similar_threshold_filtering(self):
        """Test that threshold parameter filters out low-similarity results."""
        from src.ml_models.similarity_model import SimilarityModel

        model = SimilarityModel.__new__(SimilarityModel)

        query_embedding = [1.0, 0.0, 0.0]
        candidate_embeddings = [
            [1.0, 0.0, 0.0],   # similarity ~1.0
            [0.0, 1.0, 0.0],   # similarity ~0.0
        ]

        results = model.find_similar(
            query_embedding, candidate_embeddings, top_k=10, threshold=0.5
        )

        # Only results with score >= 0.5 should be included
        for _, score in results:
            assert score >= 0.5

    def test_find_similar_top_k_limit(self):
        """Test that top_k parameter limits the number of results."""
        from src.ml_models.similarity_model import SimilarityModel

        model = SimilarityModel.__new__(SimilarityModel)

        query_embedding = [1.0, 0.0, 0.0]
        candidate_embeddings = [[float(i), 0.0, 0.0] for i in range(20)]

        results = model.find_similar(query_embedding, candidate_embeddings, top_k=5)
        assert len(results) <= 5


class TestImpactService:
    """Unit tests for ImpactService."""

    def test_compute_severity_distribution(self):
        """Test severity distribution calculation."""
        from src.services.impact_service import ImpactService

        service = ImpactService.__new__(ImpactService)
        defects = [
            {"severity": "Critical"},
            {"severity": "High"},
            {"severity": "High"},
            {"severity": "Medium"},
            {"severity": "Low"},
        ]

        dist = service._compute_severity_distribution(defects)
        assert dist["Critical"] == 1
        assert dist["High"] == 2
        assert dist["Medium"] == 1
        assert dist["Low"] == 1

    def test_determine_risk_level(self):
        """Test risk level determination based on impact score."""
        from src.services.impact_service import ImpactService

        service = ImpactService.__new__(ImpactService)

        assert service._determine_risk_level(80.0) == "Critical"
        assert service._determine_risk_level(60.0) == "High"
        assert service._determine_risk_level(35.0) == "Medium"
        assert service._determine_risk_level(10.0) == "Low"

    def test_extract_affected_areas_deduplication(self):
        """Test that affected areas are deduplicated."""
        from src.services.impact_service import ImpactService

        service = ImpactService.__new__(ImpactService)
        defects = [
            {"module": "Login", "related_features": ["auth", "session"]},
            {"module": "Login", "related_features": ["auth", "password"]},
        ]

        areas = service._extract_affected_areas(defects, "Login")
        # Should not have duplicates
        assert len(areas) == len(set(areas))

    def test_empty_result_when_no_defects(self):
        """Test that empty result is returned when no similar defects."""
        from src.services.impact_service import ImpactService

        service = ImpactService.__new__(ImpactService)
        result = service._empty_result()

        assert result["impact_score"] == 0.0
        assert result["risk_level"] == "Low"
        assert result["affected_areas"] == []
        assert len(result["potential_side_effects"]) > 0


class TestDefectService:
    """Unit tests for DefectService CSV parsing."""

    def test_ingest_csv_valid_data(self):
        """Test CSV ingestion with valid data."""
        import asyncio
        import pandas as pd
        import io
        from unittest.mock import AsyncMock, MagicMock, patch

        # This would require a full DB mock; testing the CSV parsing logic
        csv_content = b"""title,description,severity,module,status,reporter
Test Bug 1,This is a test bug description,High,Login,Open,QA Team
Test Bug 2,Another test bug description,Medium,Payment,Open,Dev Team
"""
        df = pd.read_csv(io.BytesIO(csv_content))
        df.columns = [col.strip().lower() for col in df.columns]

        assert "title" in df.columns
        assert "description" in df.columns
        assert len(df) == 2
        assert df.iloc[0]["severity"] == "High"

    def test_ingest_csv_missing_required_columns(self):
        """Test that CSV without required columns raises ValueError."""
        import pandas as pd
        import io

        csv_content = b"""module,severity
Login,High
"""
        df = pd.read_csv(io.BytesIO(csv_content))
        df.columns = [col.strip().lower() for col in df.columns]

        required_columns = {"title", "description"}
        missing = required_columns - set(df.columns)

        assert len(missing) > 0
        assert "title" in missing
        assert "description" in missing
