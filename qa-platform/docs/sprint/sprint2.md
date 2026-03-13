# Sprint 2 — 결함 데이터 관리 + 유사 결함 조회

> **릴리즈**: R1 — MVP | **기간**: Week 3–4 (2주)
> **스프린트 목표**: CSV로 결함을 업로드하고, 변경 내용 입력 시 유사 결함 Top-10을 5초 이내에 반환한다.

---

## 스프린트 개요

| 항목 | 내용 |
|------|------|
| 기간 | Week 3 ~ Week 4 (10 영업일) |
| 팀 구성 | Backend 1명 + Frontend 1명 |
| 총 스토리 포인트 | **32 SP** |
| 예상 총 공수 | **128시간** (1 SP = 4시간 기준) |
| Velocity 목표 | 32 SP |
| 선행 스프린트 | Sprint 1 완료 필수 |

---

## 스프린트 목표 (Sprint Goal)

> "QA 팀원이 과거 결함 CSV를 업로드하거나 더미 데이터를 주입한 뒤,
> 신규 변경 내용을 텍스트로 입력하면 의미적으로 유사한 과거 결함 목록을
> 유사도 점수와 함께 5초 이내에 확인할 수 있다."

---

## 태스크 목록

### Backend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S2-B1 | `POST /api/defects/upload` — pandas CSV 파싱 + 임베딩 자동 계산 | 5 | 20h | BE | 100행 CSV 업로드 시 30초 이내 완료, 파싱 실패 행 에러 리포트 |
| S2-B2 | `GET /api/defects` — 페이지네이션(page, size), severity 필터 | 2 | 8h | BE | `?page=2&size=10&severity=Critical` 정상 동작 |
| S2-B3 | `GET /api/defects/{id}` — 단건 조회 | 1 | 4h | BE | 없는 ID → 404, 응답 스키마 일치 |
| S2-B4 | `POST /api/defects/seed` — 20건 더미 데이터 주입 | 1 | 4h | BE | 중복 호출 시 idempotent (UPSERT) |
| S2-B5 | `POST /api/analysis/similar-defects` — cosine similarity Top-10 | 5 | 20h | BE | 응답시간 ≤ 5초 (20건 기준), similarity_score 0~1 범위 |
| S2-B6 | SentenceTransformer 싱글톤 로딩 (앱 시작 시 1회) | 3 | 12h | BE | 첫 요청 후 재요청 ≤ 1초, 메모리 누수 없음 |

**Backend 소계**: **17 SP / 68시간**

---

### Frontend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S2-F1 | DefectsPage — 드래그앤드롭 CSV 업로드 + 진행률 표시 | 5 | 20h | FE | 업로드 완료 후 결함 목록 자동 갱신, 진행률 % 표시 |
| S2-F2 | 결함 목록 테이블 (severity 필터, 페이지네이션) | 3 | 12h | FE | Critical=빨강/High=주황/Medium=노랑/Low=초록 뱃지 |
| S2-F3 | BugListComponent — 유사 결함 카드 (유사도 점수 ProgressBar 포함) | 3 | 12h | FE | 유사도 ≥0.9 → 초록, 0.6~0.9 → 노랑, <0.6 → 빨강 |
| S2-F4 | ImpactAnalysisPage — 변경 설명 입력 textarea + 분석 버튼 | 2 | 8h | FE | 빈 입력 시 버튼 비활성화, 글자 수 카운터 표시 |
| S2-F5 | 로딩 스피너 + React Query 캐싱 (5분 stale) | 2 | 8h | FE | 동일 쿼리 5분 이내 재요청 시 캐시 히트, 네트워크 탭 확인 |

**Frontend 소계**: **15 SP / 60시간**

---

## 공수 요약

| 구분 | SP | 예상 공수 | 비율 |
|------|----|---------|------|
| Backend | 17 | 68h | 53% |
| Frontend | 15 | 60h | 47% |
| **합계** | **32** | **128h** | 100% |

### 일별 계획 (2인 기준)

| Day | Backend | Frontend |
|-----|---------|----------|
| Day 1 | S2-B6 SentenceTransformer 싱글톤 설계 | S2-F4 분석 페이지 기본 UI |
| Day 2 | S2-B6 싱글톤 구현 + 로딩 최적화 | S2-F5 React Query + 로딩 스피너 |
| Day 3 | S2-B4 seed 엔드포인트 + S2-B3 단건 조회 | S2-F1 CSV 업로드 UI |
| Day 4 | S2-B1 CSV 파싱 + 임베딩 계산 | S2-F1 드래그앤드롭 + 진행률 |
| Day 5 | S2-B1 업로드 성능 테스트 | S2-F2 결함 목록 테이블 |
| Day 6 | S2-B2 페이지네이션 + 필터 | S2-F2 severity 뱃지 + 필터 연동 |
| Day 7 | S2-B5 유사도 API 구현 | S2-F3 BugListComponent 카드 UI |
| Day 8 | S2-B5 성능 최적화 (≤5초) | S2-F3 유사도 ProgressBar |
| Day 9 | 통합 테스트 + 버그 수정 | 통합 테스트 + 버그 수정 |
| Day 10 | **스프린트 리뷰 + 회고** | **스프린트 리뷰 + 회고** |

---

## 완료 조건 (Definition of Done)

- [ ] 모든 스토리 포인트 완료 및 PR 머지
- [ ] CSV 100행 업로드 30초 이내 완료
- [ ] 유사 결함 조회 응답시간 P95 ≤ 5초
- [ ] SentenceTransformer 재요청 응답 ≤ 1초
- [ ] severity 필터 + 페이지네이션 정상 동작
- [ ] 유사도 점수 색상 구분 (3단계) 정상 표시
- [ ] Playwright defects.spec.ts 4개 시나리오 통과
- [ ] Unit 테스트: similarity_model.py 커버리지 ≥ 80%

---

## Playwright 검증 시나리오

참조: `frontend/tests/e2e/defects.spec.ts`

| 시나리오 | 검증 포인트 | 타임아웃 |
|---------|-----------|---------|
| CSV 업로드 후 목록 갱신 | 업로드 진행률 → 완료 토스트 → 목록 갱신 | 30s |
| severity 필터 — Critical만 표시 | 필터 선택 후 뱃지 전수 확인 | 5s |
| 유사 결함 조회 5초 이내 반환 | `Date.now()` 측정 < 5000ms | 5s |
| 유사 결함 카드 필수 요소 표시 | 유사도 점수 + 심각도 뱃지 + 제목 | 5s |

```bash
npx playwright test defects.spec.ts --project=chromium
```

---

## 의존성

| 의존 항목 | 유형 | 비고 |
|---------|------|------|
| Sprint 1 완료 (인증 + DB) | 선행 스프린트 | 필수 |
| sentence-transformers 2.7.0 | 패키지 | requirements.txt |
| `paraphrase-multilingual-MiniLM-L12-v2` 모델 | 외부 다운로드 | 첫 실행 시 ~500MB 다운로드 |
| pandas 2.2.2 | 패키지 | CSV 파싱용 |
| React Query (TanStack) | 패키지 | package.json |

---

## 기술 부채

| 항목 | 내용 | 해소 시점 |
|------|------|---------|
| 전수 코사인 유사도 계산 | 결함 수 증가 시 O(n) 성능 저하 | Sprint 5 (pgvector ANN) |
| JSON 배열 임베딩 저장 | PostgreSQL JSONB, 벡터 검색 불가 | Sprint 5 (pgvector) |
| 모델 로컬 다운로드 | 컨테이너 재시작 시 재다운로드 | Sprint 5 (볼륨 마운트) |

---

## 리스크

| 리스크 | 확률 | 영향도 | 대응 방안 |
|--------|------|--------|---------|
| 모델 로딩 시간 초과 (첫 요청 30초+) | 고 | 고 | 앱 시작 시 워밍업 + 로딩 완료 후 라우터 활성화 |
| CSV 인코딩 문제 (EUC-KR) | 중 | 중 | pandas `encoding` 자동 감지 + 에러 핸들링 |
| 임베딩 계산 메모리 부족 | 중 | 중 | 배치 처리 (batch_size=32) 적용 |

---

*스프린트 작성일: 2026-03-13 | 상태: 🟡 계획됨*
