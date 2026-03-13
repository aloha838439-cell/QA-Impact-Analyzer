from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import logging

from src.models.defect import Defect
from src.ml_models.similarity_model import SimilarityModel
from src.config.settings import settings

logger = logging.getLogger(__name__)

# Module-level model instance (cached)
_similarity_model: Optional[SimilarityModel] = None


def get_similarity_model() -> SimilarityModel:
    """Get or create the cached SimilarityModel instance."""
    global _similarity_model
    if _similarity_model is None:
        _similarity_model = SimilarityModel(model_name=settings.SENTENCE_TRANSFORMER_MODEL)
    return _similarity_model


class SimilarityService:
    """Service for computing semantic similarity between defects."""

    def __init__(self, db: Session):
        self.db = db
        self.model = get_similarity_model()

    async def find_similar_defects(
        self,
        query: str,
        module_filter: Optional[str] = None,
        top_k: int = 10,
        threshold: float = 0.0,
    ) -> List[Dict[str, Any]]:
        """Find defects similar to the given query text.

        Args:
            query: The search query text
            module_filter: Optional module name to filter results
            top_k: Number of top results to return
            threshold: Minimum similarity score

        Returns:
            List of defect dicts with similarity_score field added
        """
        # Query defects that have embeddings
        defect_query = self.db.query(Defect).filter(Defect.embedding.isnot(None))
        if module_filter:
            defect_query = defect_query.filter(Defect.module.ilike(f"%{module_filter}%"))

        defects = defect_query.all()

        if not defects:
            logger.warning("No defects with embeddings found in database")
            return []

        # Encode the query
        query_text = f"{query}"
        query_embedding = self.model.encode_single(query_text)

        if not query_embedding:
            logger.error("Failed to encode query text")
            return []

        # Get embeddings for all defects
        defect_embeddings = []
        valid_defects = []
        for defect in defects:
            if defect.embedding and len(defect.embedding) > 0:
                defect_embeddings.append(defect.embedding)
                valid_defects.append(defect)

        if not defect_embeddings:
            return []

        # Find similar defects
        similar_indices = self.model.find_similar(
            query_embedding=query_embedding,
            candidate_embeddings=defect_embeddings,
            top_k=top_k,
            threshold=threshold,
        )

        # Build results
        results = []
        for idx, score in similar_indices:
            defect = valid_defects[idx]
            defect_dict = defect.to_dict()
            defect_dict["similarity_score"] = round(score, 4)
            results.append(defect_dict)

        return results

    async def compute_and_store_embedding(self, defect: Defect) -> bool:
        """Compute and store the embedding for a defect.

        Args:
            defect: The Defect model instance

        Returns:
            True if successful, False otherwise
        """
        try:
            # Combine title and description for richer embedding
            text = f"{defect.title}. {defect.description}"
            if defect.module:
                text += f" Module: {defect.module}"
            if defect.related_features:
                features = ", ".join(defect.related_features) if isinstance(defect.related_features, list) else str(defect.related_features)
                text += f" Features: {features}"

            embedding = self.model.encode_single(text)
            if embedding:
                defect.embedding = embedding
                self.db.commit()
                return True
        except Exception as e:
            logger.error(f"Error computing embedding for defect {defect.id}: {e}")
            self.db.rollback()

        return False

    async def recompute_all_embeddings(self) -> Dict[str, int]:
        """Recompute embeddings for all defects in the database."""
        defects = self.db.query(Defect).all()
        success_count = 0
        error_count = 0

        for defect in defects:
            success = await self.compute_and_store_embedding(defect)
            if success:
                success_count += 1
            else:
                error_count += 1

        return {"success": success_count, "errors": error_count}
