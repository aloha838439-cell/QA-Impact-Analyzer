"""
고정 차원 해시 기반 텍스트 인코딩 (sentence-transformers 없이 동작)
- 512차원 고정 벡터 → 모든 텍스트가 동일한 차원으로 인코딩됨
- 어휘 사전 불필요 → encode_single 호출마다 일관된 차원 보장
"""
import re
import numpy as np
from typing import List, Tuple

EMBEDDING_DIM = 512


def _hash_encode(text: str, dim: int = EMBEDDING_DIM) -> np.ndarray:
    """고정 dim 해시 벡터: 단어 + 바이그램 → 버킷 인덱스로 누산."""
    vec = np.zeros(dim, dtype=np.float32)
    text_lower = text.lower()
    words = re.findall(r'\w+', text_lower)
    tokens = words + [f"{words[i]}_{words[i+1]}" for i in range(len(words) - 1)]
    for token in tokens:
        idx = abs(hash(token)) % dim
        vec[idx] += 1.0
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm
    return vec


def _cosine_sim(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    dot = a @ b.T
    na = np.linalg.norm(a, axis=1, keepdims=True)
    nb = np.linalg.norm(b, axis=1, keepdims=True)
    denom = na @ nb.T
    return dot / np.where(denom == 0, 1e-9, denom)


class SimilarityModel:
    def __init__(self, model_name: str = "hash512"):
        self.model_name = model_name
        self.dim = EMBEDDING_DIM

    def encode(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.array([])
        return np.stack([_hash_encode(str(t)) for t in texts])

    def encode_single(self, text: str) -> List[float]:
        return _hash_encode(str(text)).tolist()

    def find_similar(
        self,
        query_embedding: List[float],
        candidate_embeddings: List[List[float]],
        top_k: int = 10,
        threshold: float = 0.0,
    ) -> List[Tuple[int, float]]:
        if not candidate_embeddings or not query_embedding:
            return []

        q = np.array(query_embedding, dtype=np.float32).reshape(1, -1)

        # 차원이 다른 임베딩은 길이를 맞춰 처리
        fixed = []
        for emb in candidate_embeddings:
            arr = np.array(emb, dtype=np.float32)
            if len(arr) < self.dim:
                arr = np.pad(arr, (0, self.dim - len(arr)))
            elif len(arr) > self.dim:
                arr = arr[:self.dim]
            fixed.append(arr)

        candidates = np.stack(fixed)

        if q.shape[1] != self.dim:
            q_fixed = np.zeros((1, self.dim), dtype=np.float32)
            l = min(q.shape[1], self.dim)
            q_fixed[0, :l] = q[0, :l]
            q = q_fixed

        scores = _cosine_sim(q, candidates)[0]
        sorted_idx = np.argsort(scores)[::-1]

        return [
            (int(i), float(scores[i]))
            for i in sorted_idx[:top_k]
            if float(scores[i]) >= threshold
        ]

    def batch_compute_similarity(
        self, queries: List[str], candidates: List[str]
    ) -> np.ndarray:
        if not queries or not candidates:
            return np.array([])
        q_emb = self.encode(queries)
        c_emb = self.encode(candidates)
        return _cosine_sim(q_emb, c_emb)


def get_model(model_name: str = "hash512") -> SimilarityModel:
    return SimilarityModel(model_name)
