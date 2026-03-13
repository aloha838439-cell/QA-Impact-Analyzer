# Sprint 3 — 영향도 분석 + 테스트케이스 자동 제안

> **릴리즈**: R1 — MVP | **기간**: Week 5–6 (2주)
> **스프린트 목표**: 분석 파이프라인 3단계(유사결함 → 영향도 → 테스트케이스)가 10초 이내에 완성된다.

---

## 스프린트 개요

| 항목 | 내용 |
|------|------|
| 기간 | Week 5 ~ Week 6 (10 영업일) |
| 팀 구성 | Backend 1명 + Frontend 1명 |
| 총 스토리 포인트 | **33 SP** |
| 예상 총 공수 | **132시간** (1 SP = 4시간 기준) |
| Velocity 목표 | 33 SP |
| 선행 스프린트 | Sprint 1, 2 완료 필수 |

---

## 스프린트 목표 (Sprint Goal)

> "QA 팀원이 변경 내용과 영향 모듈을 입력하면,
> 유사 결함 → 영향도 점수(게이지) → 테스트케이스 3개 이상이
> 순차적으로 10초 이내에 화면에 표시되고, TC를 인라인으로 편집·저장할 수 있다."

---

## 태스크 목록

### Backend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S3-B1 | `POST /api/analysis/impact` — 가중치 점수 계산 (유사도 45%+심각도 35%+모듈 20%) | 5 | 20h | BE | impact_score 0~1 범위, affected_areas 최소 1개, potential_side_effects 반환 |
| S3-B2 | `POST /api/analysis/test-cases` — 템플릿 기반 3~5개 생성 | 5 | 20h | BE | steps 최소 3개, expected_result 비어있지 않음, title 고유 |
| S3-B3 | ImpactAnalysis + TestCase DB 저장 + 히스토리 조회 | 3 | 12h | BE | `GET /api/analysis/history` 최신순 정렬, 페이지네이션 |
| S3-B4 | 전체 파이프라인 성능 최적화 (≤ 10초) | 3 | 12h | BE | k6 단독 사용자 기준 P95 ≤ 10초, 각 단계 로그 타임스탬프 |

**Backend 소계**: **16 SP / 64시간**

---

### Frontend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S3-F1 | ImpactVisualization — 원형 게이지(impact_score) + 영향 영역 칩 + side effects 리스트 | 5 | 20h | FE | impact_score ≥ 0.8 → 빨간 게이지, ≥ 0.5 → 노랑, < 0.5 → 초록 |
| S3-F2 | TestCaseCard — 제목/단계/기대결과 표시 + 인라인 편집 모드 | 5 | 20h | FE | 편집 후 저장 시 UI 즉시 반영, 취소 시 원복 |
| S3-F3 | 3단계 순차 파이프라인 UI (Step 1→2→3 진행 표시기) | 3 | 12h | FE | 각 단계별 개별 로딩 스피너, 완료 단계 체크마크 표시 |
| S3-F4 | 모듈 칩 선택기 (affected_modules 다중 선택) | 2 | 8h | FE | 선택된 모듈 하이라이트(인디고), 최대 10개 제한 |
| S3-F5 | 반응형 레이아웃 — 태블릿(768px)에서 1컬럼 스택 | 2 | 8h | FE | Chrome DevTools 768px 뷰 정상, 3컬럼 → 1컬럼 전환 확인 |

**Frontend 소계**: **17 SP / 68시간**

---

## 공수 요약

| 구분 | SP | 예상 공수 | 비율 |
|------|----|---------|------|
| Backend | 16 | 64h | 48% |
| Frontend | 17 | 68h | 52% |
| **합계** | **33** | **132h** | 100% |

### 일별 계획 (2인 기준)

| Day | Backend | Frontend |
|-----|---------|----------|
| Day 1 | S3-B1 영향도 점수 로직 설계 | S3-F3 파이프라인 진행 표시기 UI |
| Day 2 | S3-B1 가중치 계산 + 테스트 | S3-F3 단계별 로딩 상태 연동 |
| Day 3 | S3-B2 TC 템플릿 설계 | S3-F4 모듈 칩 선택기 |
| Day 4 | S3-B2 TC 생성 로직 구현 | S3-F1 영향도 게이지 컴포넌트 |
| Day 5 | S3-B3 DB 저장 + 히스토리 API | S3-F1 영향 영역 칩 + side effects |
| Day 6 | S3-B4 파이프라인 성능 프로파일링 | S3-F2 TestCaseCard 기본 표시 |
| Day 7 | S3-B4 성능 최적화 (비동기 처리) | S3-F2 인라인 편집 모드 |
| Day 8 | S3-B4 k6 부하 테스트 | S3-F5 반응형 레이아웃 |
| Day 9 | E2E 통합 테스트 + 버그 수정 | E2E 통합 테스트 + 버그 수정 |
| Day 10 | **R1 MVP 스프린트 리뷰 + 회고** | **R1 MVP 스프린트 리뷰 + 회고** |

---

## 영향도 점수 계산 로직 명세

```
impact_score = (similarity_score × 0.45) + (severity_score × 0.35) + (module_score × 0.20)

- similarity_score: Top-3 유사 결함 평균 유사도 (0~1)
- severity_score:
    Critical → 1.0
    High     → 0.75
    Medium   → 0.5
    Low      → 0.25
- module_score: 선택된 모듈 중 과거 결함이 발생한 모듈 비율 (0~1)
```

---

## 테스트케이스 생성 템플릿 명세

각 TC는 다음 구조로 생성:
```json
{
  "title": "[모듈] [변경 키워드] 기능 검증",
  "description": "유사 결함 '{top_defect_title}'을 참고하여 생성",
  "steps": [
    "1. 사전 조건 설정 (관련 모듈 상태 초기화)",
    "2. 변경된 기능 실행 (정상 케이스)",
    "3. 결과 검증",
    "4. 경계 조건 테스트 (비정상 케이스)",
    "5. 롤백 또는 복구 동작 확인"
  ],
  "expected_result": "시스템이 정상적으로 동작하며 과거 결함 패턴이 재현되지 않음"
}
```

---

## 완료 조건 (Definition of Done)

- [ ] 모든 스토리 포인트 완료 및 PR 머지
- [ ] impact_score 0~1 범위, affected_areas ≥ 1개 반환
- [ ] 테스트케이스 3~5개 자동 생성, steps ≥ 3개
- [ ] 전체 파이프라인 P95 ≤ 10초
- [ ] TC 인라인 편집 + 저장 동작
- [ ] 태블릿(768px) 1컬럼 레이아웃 확인
- [ ] Playwright analysis-pipeline.spec.ts 5개 시나리오 통과
- [ ] R1 MVP 완료 기준 체크리스트 전항목 통과

---

## Playwright 검증 시나리오

참조: `frontend/tests/e2e/analysis-pipeline.spec.ts`

| 시나리오 | 검증 포인트 | 타임아웃 |
|---------|-----------|---------|
| 전체 파이프라인 10초 이내 완료 | 3단계 순차 완료 + elapsed < 10000ms | 10s |
| impact_score 게이지 범위 검증 | 0 ≤ score ≤ 1 | 8s |
| TC 최소 3개 + 필수 요소 | count ≥ 3, title/steps/expected 비어있지 않음 | 10s |
| TC 인라인 편집 후 저장 | 저장 후 UI 즉시 반영 | 10s |
| 태블릿 1컬럼 레이아웃 | impactSection.y > similarSection.y | 10s |

```bash
npx playwright test analysis-pipeline.spec.ts --project=chromium
npx playwright test analysis-pipeline.spec.ts --project=tablet
```

---

## R1 MVP 완료 기준 최종 체크

| 체크 항목 | 담당 스프린트 | 상태 |
|---------|------------|------|
| 과거 결함 데이터 적재 가능 | S2 | ⬜ |
| 유사 결함 5초 이내 반환 | S2 | ⬜ |
| 영향도 분석 5초 이내 시각화 | S3 | ⬜ |
| TC 최소 3개 자동 제안 (10초 이내) | S3 | ⬜ |
| 로그인/로그아웃 + 미인증 차단 | S1 | ⬜ |
| 데스크톱/태블릿 레이아웃 정상 | S1+S3 | ⬜ |

---

## 의존성

| 의존 항목 | 유형 | 비고 |
|---------|------|------|
| Sprint 2 완료 (유사 결함 API) | 선행 스프린트 | S3-B1이 유사 결함 결과를 입력으로 사용 |
| S3-B1 완료 | 내부 의존 | S3-B2가 영향도 결과를 입력으로 사용 |

---

## 리스크

| 리스크 | 확률 | 영향도 | 대응 방안 |
|--------|------|--------|---------|
| 파이프라인 10초 초과 | 중 | 고 | 각 단계 병렬화 + 임베딩 캐싱 도입 |
| TC 생성 품질 낮음 | 중 | 중 | 유사 결함 컨텍스트를 최대 활용, 추후 LLM 고도화 |
| 영향도 점수 신뢰성 | 중 | 중 | Phase 2에서 실측 데이터로 가중치 재튜닝 예정으로 명시 |

---

*스프린트 작성일: 2026-03-13 | 상태: 🟡 계획됨*
