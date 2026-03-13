# Sprint 5 — AI 모델 고도화 + 대시보드

> **릴리즈**: R2 — Enhanced | **기간**: Week 9–10 (2주)
> **스프린트 목표**: pgvector 도입으로 유사도 검색을 고도화하고, 핵심 지표 대시보드를 제공한다.

---

## 스프린트 개요

| 항목 | 내용 |
|------|------|
| 기간 | Week 9 ~ Week 10 (10 영업일) |
| 팀 구성 | Backend 1명 + Frontend 1명 |
| 총 스토리 포인트 | **26 SP** |
| 예상 총 공수 | **104시간** (1 SP = 4시간 기준) |
| Velocity 목표 | 26 SP |
| 선행 스프린트 | Sprint 4 완료 필수 |

---

## 스프린트 목표 (Sprint Goal)

> "pgvector ANN 검색으로 1000건 기준 유사 결함 응답시간을 2초 이내로 단축하고,
> 대시보드에서 심각도 분포 차트와 Side effect 감소율 지표를 확인할 수 있다."

---

## 태스크 목록

### Backend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S5-B1 | pgvector 도입 — PostgreSQL 벡터 확장 + Alembic 마이그레이션 + ANN 검색 | 8 | 32h | BE | 1000건 기준 유사 결함 응답 ≤ 2초, 기존 JSON 임베딩 마이그레이션 완료 |
| S5-B2 | 유사도 임계값 튜닝 + False Positive 감소 (임계값 0.65 적용) | 5 | 20h | BE | precision 향상 확인 (기존 대비 FP율 20% 감소 목표), A/B 테스트 결과 문서화 |
| S5-B3 | TC 생성 품질 개선 — 컨텍스트 윈도우 확장 + 유사 결함 Top-5 활용 | 5 | 20h | BE | TC 평균 길이 증가, steps 평균 ≥ 4개, 중복 TC 제거 로직 |

**Backend 소계**: **18 SP / 72시간**

---

### Frontend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S5-F1 | DashboardPage — Recharts 막대/도넛 차트 (심각도 분포, 모듈별 결함 수) | 5 | 20h | FE | SVG 렌더링 확인, 빈 데이터 시 empty state 표시 |
| S5-F2 | 핵심 지표 카드 — Side effect 감소율, TC 활용률, 총 결함 수, 총 분석 수 | 3 | 12h | FE | 카드 4개 표시, 수치 포맷 (%, 건) 정상 |

**Frontend 소계**: **8 SP / 32시간**

---

## 공수 요약

| 구분 | SP | 예상 공수 | 비율 |
|------|----|---------|------|
| Backend | 18 | 72h | 69% |
| Frontend | 8 | 32h | 31% |
| **합계** | **26** | **104h** | 100% |

### 일별 계획 (2인 기준)

| Day | Backend | Frontend |
|-----|---------|----------|
| Day 1 | S5-B1 pgvector 확장 설치 + 스키마 설계 | S5-F1 대시보드 레이아웃 + 차트 설계 |
| Day 2 | S5-B1 Alembic 마이그레이션 (vector 컬럼) | S5-F1 Recharts BarChart 심각도 분포 |
| Day 3 | S5-B1 기존 JSON 임베딩 → vector 마이그레이션 스크립트 | S5-F1 Recharts DonutChart 모듈별 분포 |
| Day 4 | S5-B1 HNSW 인덱스 생성 + ANN 쿼리 구현 | S5-F2 핵심 지표 카드 4개 |
| Day 5 | S5-B1 성능 벤치마크 (1000건 ≤ 2초) | S5-F2 API 연동 + 로딩 상태 |
| Day 6 | S5-B2 임계값 A/B 테스트 설계 | S5-F1 반응형 차트 처리 |
| Day 7 | S5-B2 임계값 튜닝 + FP 감소 검증 | S5-F1 빈 데이터 empty state |
| Day 8 | S5-B3 TC 컨텍스트 윈도우 확장 | 대시보드 통합 테스트 |
| Day 9 | S5-B3 중복 TC 제거 + 품질 테스트 | Playwright dashboard.spec.ts |
| Day 10 | **스프린트 리뷰 + 회고** | **스프린트 리뷰 + 회고** |

---

## pgvector 마이그레이션 계획

```sql
-- 1단계: pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 2단계: defects 테이블에 vector 컬럼 추가
ALTER TABLE defects ADD COLUMN embedding_vec vector(384);

-- 3단계: 기존 JSON 임베딩 마이그레이션 (Python 스크립트)
-- SELECT id, embedding FROM defects WHERE embedding_vec IS NULL
-- → Python: embedding_vec = json.loads(embedding)
-- → UPDATE defects SET embedding_vec = embedding_vec::vector WHERE id = ...

-- 4단계: HNSW 인덱스 생성 (코사인 거리)
CREATE INDEX ON defects USING hnsw (embedding_vec vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 5단계: ANN 검색 쿼리
SELECT id, title, severity, 1 - (embedding_vec <=> $1::vector) AS similarity
FROM defects
WHERE 1 - (embedding_vec <=> $1::vector) > 0.65
ORDER BY embedding_vec <=> $1::vector
LIMIT 10;
```

---

## 유사도 임계값 튜닝 계획

| 임계값 | 예상 결과 | 판단 기준 |
|--------|---------|---------|
| 0.50 | FP 많음, 재현율 높음 | 불필요한 노이즈 다수 |
| 0.65 | **적정 (권장)** | FP/FN 균형 |
| 0.80 | FP 적음, 재현율 낮음 | 관련 결함 누락 위험 |

---

## Playwright 검증 시나리오

참조: `frontend/tests/e2e/dashboard.spec.ts`

| 시나리오 | 검증 포인트 |
|---------|-----------|
| 핵심 지표 카드 4개 표시 | stat-card 4개 visible |
| 심각도 분포 차트 SVG 렌더링 | svg 요소 존재 확인 |
| 최근 분석 히스토리 표시 | 분석 수행 후 목록 갱신 |

```bash
npx playwright test dashboard.spec.ts --project=chromium
```

---

## 완료 조건 (Definition of Done)

- [ ] pgvector 마이그레이션 완료 (기존 데이터 손실 없음)
- [ ] 1000건 기준 유사 결함 응답 ≤ 2초 (벤치마크 결과 문서화)
- [ ] 유사도 임계값 0.65 적용 후 FP 20% 감소 확인
- [ ] 대시보드 차트 2종 (막대, 도넛) 정상 렌더링
- [ ] 핵심 지표 카드 4개 표시
- [ ] Playwright dashboard.spec.ts 3개 시나리오 통과

---

## 기술 부채 해소

| 항목 | 해소 방법 |
|------|---------|
| JSON 배열 임베딩 저장 (R1 부채) | pgvector vector 타입으로 전환 |
| 인메모리 전수 비교 (R1 부채) | HNSW 인덱스 ANN 검색으로 대체 |

---

## 의존성

| 의존 항목 | 유형 | 비고 |
|---------|------|------|
| PostgreSQL pgvector 확장 | DB 확장 | PostgreSQL 15+ 필요 |
| pgvector Python 패키지 | 패키지 | `pip install pgvector` |
| Recharts 2.x | 패키지 | package.json |

---

## 리스크

| 리스크 | 확률 | 영향도 | 대응 방안 |
|--------|------|--------|---------|
| 마이그레이션 중 데이터 손실 | 저 | 고 | 마이그레이션 전 DB 스냅샷 + 롤백 스크립트 준비 |
| HNSW 인덱스 메모리 사용량 증가 | 중 | 중 | `m=16` 설정으로 메모리 제한 |
| 임계값 0.65가 도메인에 부적합 | 중 | 중 | 실 데이터 투입 후 1주 후 재측정 예정 |

---

*스프린트 작성일: 2026-03-13 | 상태: 🟡 계획됨*
