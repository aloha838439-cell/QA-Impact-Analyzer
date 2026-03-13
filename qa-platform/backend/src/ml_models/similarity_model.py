import numpy as np
from typing import List, Optional, Tuple
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import threading
import logging

logger = logging.getLogger(__name__)

_model_lock = threading.Lock()
_model_instance: Optional[SentenceTransformer] = None


def get_model(model_name: str = "paraphrase-multilingual-MiniLM-L12-v2") -> SentenceTransformer:
    """Get or create the singleton SentenceTransformer model instance."""
    global _model_instance
    if _model_instance is None:
        with _model_lock:
            if _model_instance is None:
                logger.info(f"Loading sentence transformer model: {model_name}")
                _model_instance = SentenceTransformer(model_name)
                logger.info("Model loaded successfully")
    return _model_instance


class SimilarityModel:
    """Wrapper around SentenceTransformer for defect similarity computation."""

    def __init__(self, model_name: str = "paraphrase-multilingual-MiniLM-L12-v2"):
        self.model_name = model_name
        self._model: Optional[SentenceTransformer] = None

    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            self._model = get_model(self.model_name)
        return self._model

    def encode(self, texts: List[str]) -> np.ndarray:
        """Encode a list of texts into embeddings.

        Args:
            texts: List of text strings to encode

        Returns:
            numpy array of shape (n_texts, embedding_dim)
        """
        if not texts:
            return np.array([])

        # Normalize texts
        normalized = [str(t).strip() for t in texts if t]

        embeddings = self.model.encode(
            normalized,
            batch_size=32,
            show_progress_bar=False,
            normalize_embeddings=True,  # L2 normalize for cosine similarity
        )
        return embeddings

    def encode_single(self, text: str) -> List[float]:
        """Encode a single text and return as list of floats for JSON storage."""
        embedding = self.encode([text])
        if len(embedding) == 0:
            return []
        return embedding[0].tolist()

    def find_similar(
        self,
        query_embedding: List[float],
        candidate_embeddings: List[List[float]],
        top_k: int = 10,
        threshold: float = 0.0,
    ) -> List[Tuple[int, float]]:
        """Find the most similar candidates to the query.

        Args:
            query_embedding: Query embedding as list of floats
            candidate_embeddings: List of candidate embeddings
            top_k: Number of top results to return
            threshold: Minimum similarity score threshold

        Returns:
            List of (index, score) tuples sorted by score descending
        """
        if not candidate_embeddings or not query_embedding:
            return []

        query_vec = np.array(query_embedding).reshape(1, -1)
        candidate_matrix = np.array(candidate_embeddings)

        # Compute cosine similarities
        scores = cosine_similarity(query_vec, candidate_matrix)[0]

        # Get sorted indices
        sorted_indices = np.argsort(scores)[::-1]

        results = []
        for idx in sorted_indices[:top_k]:
            score = float(scores[idx])
            if score >= threshold:
                results.append((int(idx), score))

        return results

    def batch_compute_similarity(
        self,
        queries: List[str],
        candidates: List[str],
    ) -> np.ndarray:
        """Compute pairwise similarity matrix between queries and candidates.

        Returns:
            Matrix of shape (n_queries, n_candidates)
        """
        query_embeddings = self.encode(queries)
        candidate_embeddings = self.encode(candidates)

        if len(query_embeddings) == 0 or len(candidate_embeddings) == 0:
            return np.array([])

        return cosine_similarity(query_embeddings, candidate_embeddings)
