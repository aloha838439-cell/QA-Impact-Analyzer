# QA Impact Analyzer — Agile Roadmap

> **비전**: 과거 결함 데이터 기반으로 영향도를 분석하고 테스트케이스를 자동 추천하여 QA 프로세스를 혁신한다.
> **목표 지표**: Side effect 감소율 30% | 테스트케이스 활용률 70% | 분석 응답시간 ≤ 5초

---

## 릴리즈 개요

| 릴리즈 | 기간 | 스프린트 | 목표 |
|--------|------|----------|------|
| **R1 — MVP** | Week 1–6 | S1~S3 | 핵심 3대 기능 + 인증 작동 |
| **R2 — Enhanced** | Week 7–12 | S4~S6 | 외부 연동 + AI 고도화 + 대시보드 |
| **R3 — Scale** | Week 13–18 | S7~S9 | 협업 + 개인화 + 보고서 + 성능 |

---

## R1 — MVP (Week 1–6)

### Sprint 1 (Week 1–2): 기반 인프라 + 인증

**목표**: 개발 환경 완성, 사용자가 로그인하여 빈 화면을 볼 수 있다.

#### Backend Stories
| ID | Story | Point | 완료 조건 |
|----|-------|-------|----------|
| S1-B1 | PostgreSQL + SQLAlchemy 모델 정의 (User, Defect, Change, ImpactAnalysis, TestCase) | 3 | `alembic upgrade head` 오류 없이 실행 |
| S1-B2 | `POST /api/auth/register` — 이메일 중복 검사, bcrypt 해싱 | 2 | 중복 이메일 409 반환 |
| S1-B3 | `POST /api/auth/login` — JWT 발급 (30분 만료) | 2 | 토큰 decode 시 sub=user_id |
| S1-B4 | `GET /api/auth/me` — Bearer 토큰 검증 | 1 | 만료 토큰 → 401 |
| S1-B5 | Docker Compose 구성 (db + backend + frontend) | 2 | `docker-compose up` 3개 서비스 정상 기동 |

#### Frontend Stories
| ID | Story | Point | 완료 조건 |
|----|-------|-------|----------|
| S1-F1 | Vite + React 18 + TypeScript + Tailwind 프로젝트 셋업 | 1 | `npm run dev` 빌드 성공 |
| S1-F2 | 로그인 페이지 UI + 폼 유효성 검사 | 3 | 이메일/비밀번호 빈값 시 인라인 에러 표시 |
| S1-F3 | 회원가입 페이지 UI + 비밀번호 강도 표시 | 2 | 8자 미만 시 약함 표시 |
| S1-F4 | Zustand authStore (토큰 localStorage 영속) | 2 | 새로고침 후 로그인 유지 |
| S1-F5 | ProtectedRoute — 미인증 시 /login 리다이렉트 | 1 | 직접 URL 접근 시 차단 |
| S1-F6 | 좌측 사이드바 + 헤더 레이아웃 (다크 테마) | 3 | 데스크톱/태블릿 레이아웃 깨짐 없음 |

**Sprint 1 Playwright 검증 시나리오** → [#playwright-s1](#playwright-sprint-1)

---

### Sprint 2 (Week 3–4): 결함 데이터 관리 + 유사 결함 조회

**목표**: CSV로 결함을 업로드하고, 변경 내용 입력 시 유사 결함 Top-10을 5초 이내에 반환한다.

#### Backend Stories
| ID | Story | Point | 완료 조건 |
|----|-------|-------|----------|
| S2-B1 | `POST /api/defects/upload` — pandas CSV 파싱 + 임베딩 자동 계산 | 5 | 100행 CSV 업로드 시 30초 이내 완료 |
| S2-B2 | `GET /api/defects` — 페이지네이션(page, size), severity 필터 | 2 | page=2&size=10 정상 동작 |
| S2-B3 | `GET /api/defects/{id}` — 단건 조회 | 1 | 없는 ID → 404 |
| S2-B4 | `POST /api/defects/seed` — 20건 더미 데이터 주입 | 1 | 중복 호출 시 idempotent |
| S2-B5 | `POST /api/analysis/similar-defects` — cosine similarity Top-10 | 5 | 응답시간 ≤ 5초 (20건 기준) |
| S2-B6 | SentenceTransformer 싱글톤 로딩 (앱 시작 시 1회) | 3 | 첫 요청 후 재요청 ≤ 1초 |

#### Frontend Stories
| ID | Story | Point | 완료 조건 |
|----|-------|-------|----------|
| S2-F1 | DefectsPage — 드래그앤드롭 CSV 업로드 + 진행률 표시 | 5 | 업로드 완료 후 결함 목록 자동 갱신 |
| S2-F2 | 결함 목록 테이블 (severity 필터, 페이지네이션) | 3 | Critical/High/Medium/Low 뱃지 색상 구분 |
| S2-F3 | BugListComponent — 유사 결함 카드 (유사도 점수 ProgressBar 포함) | 3 | 유사도 0.9 이상 → 초록, 0.6 미만 → 빨강 |
| S2-F4 | ImpactAnalysisPage — 변경 설명 입력 textarea + 분석 버튼 | 2 | 빈 입력 시 버튼 비활성화 |
| S2-F5 | 로딩 스피너 + React Query 캐싱 (5분 stale) | 2 | 동일 쿼리 재요청 시 캐시 히트 |

**Sprint 2 Playwright 검증 시나리오** → [#playwright-s2](#playwright-sprint-2)

---

### Sprint 3 (Week 5–6): 영향도 분석 + 테스트케이스 자동 제안

**목표**: 분석 파이프라인 3단계(유사결함 → 영향도 → 테스트케이스)가 10초 이내에 완성된다.

#### Backend Stories
| ID | Story | Point | 완료 조건 |
|----|-------|-------|----------|
| S3-B1 | `POST /api/analysis/impact` — 가중치 점수(유사도 45%+심각도 35%+모듈 20%) | 5 | impact_score 0~1 범위, affected_areas 최소 1개 |
| S3-B2 | `POST /api/analysis/test-cases` — 템플릿 기반 3~5개 생성 | 5 | steps 최소 3개, expected_result 비어있지 않음 |
| S3-B3 | ImpactAnalysis, TestCase DB 저장 + 히스토리 조회 | 3 | `GET /api/analysis/history` 결과 최신순 |
| S3-B4 | 성능 최적화 — 전체 파이프라인 ≤ 10초 | 3 | k6 단독 사용자 기준 P95 ≤ 10초 |

#### Frontend Stories
| ID | Story | Point | 완료 조건 |
|----|-------|-------|----------|
| S3-F1 | ImpactVisualization — 원형 게이지(impact_score) + 영향 영역 칩 + side effects 리스트 | 5 | impact_score 0.8 이상 → 빨간 게이지 |
| S3-F2 | TestCaseCard — 제목/단계/기대결과 표시 + 인라인 편집 모드 | 5 | 편집 후 저장 시 UI 즉시 반영 |
| S3-F3 | 3단계 순차 파이프라인 UI (Step 1→2→3 진행 표시기) | 3 | 각 단계별 개별 로딩 표시 |
| S3-F4 | 모듈 칩 선택기 (affected_modules 다중 선택) | 2 | 선택된 모듈 하이라이트 |
| S3-F5 | 반응형 레이아웃 — 태블릿(768px)에서 1컬럼 스택 | 2 | Chrome DevTools 태블릿 뷰 확인 |

**Sprint 3 Playwright 검증 시나리오** → [#playwright-s3](#playwright-sprint-3)

**R1 완료 기준**:
- [x] 과거 결함 데이터 적재 가능
- [x] 유사 결함 5초 이내 반환
- [x] 영향도 분석 5초 이내 시각화
- [x] 테스트케이스 최소 3개 자동 제안 (10초 이내)
- [x] 로그인/로그아웃 + 미인증 차단
- [x] 데스크톱/태블릿 레이아웃 정상

---

## R2 — Enhanced (Week 7–12)

### Sprint 4 (Week 7–8): 외부 연동 + 데이터 동기화

| ID | Story | Point |
|----|-------|-------|
| S4-B1 | Redmine API 연동 — 결함 자동 동기화 (Webhook or polling) | 8 |
| S4-B2 | 연동 설정 UI — API 키 입력, 동기화 주기 설정 | 3 |
| S4-B3 | 동기화 실패 시 재시도 큐 (Celery or BackgroundTasks) | 5 |
| S4-F1 | 연동 상태 배너 (마지막 동기화 시각 표시) | 2 |

### Sprint 5 (Week 9–10): AI 모델 고도화 + 대시보드

| ID | Story | Point |
|----|-------|-------|
| S5-B1 | pgvector 도입 — 임베딩 벡터 DB 저장 (ANN 검색) | 8 |
| S5-B2 | 유사도 임계값 튜닝 + False Positive 감소 | 5 |
| S5-B3 | 테스트케이스 생성 품질 개선 (컨텍스트 윈도우 확장) | 5 |
| S5-F1 | DashboardPage — Recharts 막대/도넛 차트 (심각도 분포, 모듈별 결함 수) | 5 |
| S5-F2 | 핵심 지표 카드 (Side effect 감소율, 테스트케이스 활용률) | 3 |

### Sprint 6 (Week 11–12): 알림 + 테스트케이스 편집 저장

| ID | Story | Point |
|----|-------|-------|
| S6-B1 | 알림 시스템 — 분석 완료 시 인앱 알림 (WebSocket or SSE) | 5 |
| S6-B2 | 이메일 알림 (중요도 High 이상 영향도 결과) | 3 |
| S6-B3 | `PATCH /api/test-cases/{id}` — 사용자 편집 내용 저장 | 2 |
| S6-F1 | 알림 드롭다운 (읽음/안읽음, 클릭 시 결과 페이지 이동) | 3 |

**R2 완료 기준**:
- [ ] Redmine 연동 시 결함 자동 동기화 ≤ 5분 지연
- [ ] pgvector ANN 검색으로 유사 결함 응답 ≤ 2초 (1000건 기준)
- [ ] 대시보드 Side effect 감소율 지표 표시
- [ ] 자동 제안 테스트케이스 활용률 측정 시작

---

## R3 — Scale (Week 13–18)

### Sprint 7 (Week 13–14): 협업 기능

| ID | Story | Point |
|----|-------|-------|
| S7-B1 | 분석 결과 공유 링크 생성 (공개/비공개) | 3 |
| S7-B2 | 테스트케이스 코멘트 API | 5 |
| S7-F1 | 코멘트 스레드 UI + @멘션 | 5 |
| S7-F2 | 팀원 초대 + 역할 관리 (QA팀원 / QA리더) | 3 |

### Sprint 8 (Week 15–16): 개인화 + 보고서

| ID | Story | Point |
|----|-------|-------|
| S8-B1 | 사용자 활동 기반 개인화 추천 (협업 필터링) | 8 |
| S8-B2 | QA 보고서 PDF 자동 생성 (WeasyPrint) | 5 |
| S8-F1 | 보고서 미리보기 + 다운로드 버튼 | 3 |
| S8-F2 | 개인화 추천 섹션 ("당신의 최근 분석 패턴 기반") | 3 |

### Sprint 9 (Week 17–18): 성능 + 안정성

| ID | Story | Point |
|----|-------|-------|
| S9-B1 | 동시 사용자 100명 부하 테스트 (k6) + 병목 해소 | 8 |
| S9-B2 | Redis 캐싱 — 임베딩 연산 결과 캐시 | 5 |
| S9-B3 | 전체 보안 감사 (SQL Injection, XSS, JWT 탈취 시나리오) | 5 |
| S9-F1 | 사용자 만족도 설문 (NPS) 인앱 위젯 | 2 |

**R3 완료 기준**:
- [ ] 동시 사용자 100명 P95 응답시간 ≤ 5초
- [ ] Side effect 감소율 30% 달성
- [ ] 테스트케이스 활용률 70% 달성
- [ ] 사용자 만족도 NPS ≥ 40

---

## Playwright MCP 검증 시나리오

> 모든 시나리오는 `qa-platform/frontend/tests/e2e/` 경로에 저장한다.
> 기본 URL: `http://localhost:3000`
> 공통 fixture: 테스트 전 seed API 호출로 20건 더미 결함 주입.

---

### Sprint 1 검증 {#playwright-sprint-1}

#### `auth.spec.ts` — 인증 플로우

```typescript
import { test, expect } from '@playwright/test';

test.describe('인증 플로우', () => {

  test('회원가입 성공 후 로그인 페이지로 이동', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[data-testid="email-input"]', 'qa-tester@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="name-input"]', 'QA 테스터');
    await page.click('[data-testid="register-btn"]');

    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('회원가입 완료');
  });

  test('올바른 자격증명으로 로그인 성공', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'qa-tester@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-btn"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  });

  test('잘못된 비밀번호로 로그인 실패 — 에러 메시지 표시', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'qa-tester@example.com');
    await page.fill('[data-testid="password-input"]', 'WrongPassword');
    await page.click('[data-testid="login-btn"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('이메일 또는 비밀번호');
    await expect(page).toHaveURL('/login');
  });

  test('미인증 사용자 보호 라우트 접근 시 /login 리다이렉트', async ({ page }) => {
    await page.goto('/analysis');
    await expect(page).toHaveURL('/login');
  });

  test('로그아웃 후 토큰 삭제 확인', async ({ page, context }) => {
    // 로그인 상태 셋업
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'qa-tester@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('/dashboard');

    await page.click('[data-testid="logout-btn"]');
    await expect(page).toHaveURL('/login');

    // localStorage 토큰 삭제 확인
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).toBeNull();
  });

});
```

---

### Sprint 2 검증 {#playwright-sprint-2}

#### `defects.spec.ts` — 결함 데이터 관리

```typescript
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('결함 데이터 관리', () => {

  test.beforeEach(async ({ page }) => {
    // 로그인 처리
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'qa-tester@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('/dashboard');
  });

  test('CSV 파일 업로드 후 결함 목록 갱신', async ({ page }) => {
    await page.goto('/defects');

    const csvPath = path.join(__dirname, 'fixtures', 'sample_defects.csv');
    await page.setInputFiles('[data-testid="csv-upload-input"]', csvPath);

    // 업로드 진행률 표시 확인
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();

    // 완료 토스트 확인
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('업로드 완료', { timeout: 30000 });

    // 결함 목록에 데이터 표시 확인
    await expect(page.locator('[data-testid="defect-row"]')).toHaveCount.greaterThan(0);
  });

  test('심각도 필터 — Critical만 선택 시 해당 항목만 표시', async ({ page }) => {
    await page.goto('/defects');
    await page.click('[data-testid="seed-btn"]'); // 더미 데이터 주입
    await page.waitForTimeout(1000);

    await page.selectOption('[data-testid="severity-filter"]', 'Critical');

    const rows = page.locator('[data-testid="defect-row"]');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('[data-testid="severity-badge"]')).toContainText('Critical');
    }
  });

  test('유사 결함 조회 — 5초 이내 Top-10 결과 반환', async ({ page }) => {
    await page.goto('/analysis');

    await page.fill('[data-testid="change-description"]',
      '로그인 페이지에서 소셜 로그인 버튼 추가 및 세션 관리 로직 변경');

    const startTime = Date.now();
    await page.click('[data-testid="find-similar-btn"]');

    await expect(page.locator('[data-testid="similar-defect-card"]').first())
      .toBeVisible({ timeout: 5000 });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(5000);

    const cards = page.locator('[data-testid="similar-defect-card"]');
    await expect(cards).toHaveCount.greaterThan(0);
  });

  test('유사 결함 카드 — 유사도 점수 및 심각도 뱃지 표시', async ({ page }) => {
    await page.goto('/analysis');
    await page.fill('[data-testid="change-description"]', '결제 모듈 카드사 API 변경');
    await page.click('[data-testid="find-similar-btn"]');

    const firstCard = page.locator('[data-testid="similar-defect-card"]').first();
    await expect(firstCard.locator('[data-testid="similarity-score"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="severity-badge"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="defect-title"]')).not.toBeEmpty();
  });

});
```

---

### Sprint 3 검증 {#playwright-sprint-3}

#### `analysis-pipeline.spec.ts` — 전체 분석 파이프라인

```typescript
import { test, expect } from '@playwright/test';

test.describe('분석 파이프라인 E2E', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'qa-tester@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('/dashboard');

    // 시드 데이터 확보
    await page.request.post('http://localhost:8000/api/defects/seed');
  });

  test('전체 파이프라인 — 10초 이내 3단계 완료', async ({ page }) => {
    await page.goto('/analysis');

    await page.fill('[data-testid="change-description"]',
      '장바구니 수량 변경 시 재고 API 동기 호출 로직을 비동기로 전환');

    // 모듈 선택
    await page.click('[data-testid="module-chip-Cart"]');
    await page.click('[data-testid="module-chip-Order"]');

    const startTime = Date.now();
    await page.click('[data-testid="analyze-btn"]');

    // Step 1: 유사 결함
    await expect(page.locator('[data-testid="step-1-complete"]')).toBeVisible({ timeout: 5000 });

    // Step 2: 영향도 분석
    await expect(page.locator('[data-testid="impact-score-gauge"]')).toBeVisible({ timeout: 5000 });

    // Step 3: 테스트케이스
    await expect(page.locator('[data-testid="test-case-card"]').first())
      .toBeVisible({ timeout: 10000 });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(10000);
  });

  test('영향도 분석 — impact_score 게이지 표시 및 범위 검증', async ({ page }) => {
    await page.goto('/analysis');
    await page.fill('[data-testid="change-description"]', '인증 토큰 만료 정책 변경');
    await page.click('[data-testid="module-chip-Login"]');
    await page.click('[data-testid="analyze-btn"]');

    await expect(page.locator('[data-testid="impact-score-gauge"]')).toBeVisible({ timeout: 8000 });

    const scoreText = await page.locator('[data-testid="impact-score-value"]').textContent();
    const score = parseFloat(scoreText ?? '0');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  test('테스트케이스 제안 — 최소 3개 생성 및 필수 요소 포함', async ({ page }) => {
    await page.goto('/analysis');
    await page.fill('[data-testid="change-description"]', '결제 API 타임아웃 처리 로직 추가');
    await page.click('[data-testid="module-chip-Payment"]');
    await page.click('[data-testid="analyze-btn"]');

    await expect(page.locator('[data-testid="test-case-card"]').first())
      .toBeVisible({ timeout: 10000 });

    const cards = page.locator('[data-testid="test-case-card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // 첫 번째 카드 필수 요소 확인
    const first = cards.first();
    await expect(first.locator('[data-testid="tc-title"]')).not.toBeEmpty();
    await expect(first.locator('[data-testid="tc-steps"]')).toBeVisible();
    await expect(first.locator('[data-testid="tc-expected"]')).not.toBeEmpty();
  });

  test('테스트케이스 인라인 편집 — 제목 수정 후 저장', async ({ page }) => {
    await page.goto('/analysis');
    await page.fill('[data-testid="change-description"]', '검색 필터 옵션 추가');
    await page.click('[data-testid="analyze-btn"]');

    await expect(page.locator('[data-testid="test-case-card"]').first())
      .toBeVisible({ timeout: 10000 });

    const firstCard = page.locator('[data-testid="test-case-card"]').first();
    await firstCard.click('[data-testid="tc-edit-btn"]');

    await firstCard.fill('[data-testid="tc-title-input"]', '수정된 테스트케이스 제목');
    await firstCard.click('[data-testid="tc-save-btn"]');

    await expect(firstCard.locator('[data-testid="tc-title"]')).toContainText('수정된 테스트케이스 제목');
  });

  test('태블릿 뷰 (768px) — 레이아웃 1컬럼 스택 확인', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/analysis');

    await page.fill('[data-testid="change-description"]', '알림 설정 API 변경');
    await page.click('[data-testid="analyze-btn"]');

    await page.waitForSelector('[data-testid="test-case-card"]', { timeout: 10000 });

    // 결과 섹션들이 세로로 스택되었는지 확인
    const similarSection = page.locator('[data-testid="similar-defects-section"]');
    const impactSection  = page.locator('[data-testid="impact-section"]');

    const similarBox = await similarSection.boundingBox();
    const impactBox  = await impactSection.boundingBox();

    // 태블릿에서 impact 섹션이 similar 섹션보다 아래에 위치
    expect(impactBox!.y).toBeGreaterThan(similarBox!.y);
  });

});
```

---

### R2 검증 {#playwright-r2}

#### `dashboard.spec.ts` — 대시보드 지표

```typescript
import { test, expect } from '@playwright/test';

test.describe('대시보드', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'qa-tester@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('/dashboard');
  });

  test('핵심 지표 카드 4개 표시', async ({ page }) => {
    await expect(page.locator('[data-testid="stat-card-total-defects"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-card-analyses"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-card-test-cases"]')).toBeVisible();
    await expect(page.locator('[data-testid="stat-card-side-effect-rate"]')).toBeVisible();
  });

  test('심각도 분포 차트 렌더링', async ({ page }) => {
    await expect(page.locator('[data-testid="severity-chart"]')).toBeVisible();
    // Recharts SVG 렌더링 확인
    await expect(page.locator('[data-testid="severity-chart"] svg')).toBeVisible();
  });

  test('최근 분석 히스토리 목록 표시', async ({ page }) => {
    // 분석 1건 수행
    await page.goto('/analysis');
    await page.fill('[data-testid="change-description"]', '대시보드 테스트용 변경');
    await page.click('[data-testid="analyze-btn"]');
    await page.waitForSelector('[data-testid="test-case-card"]', { timeout: 10000 });

    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="recent-analysis-item"]').first()).toBeVisible();
  });

});
```

---

## Playwright 설정 파일

`qa-platform/frontend/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,         // 순차 실행 (DB 상태 공유)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'tablet',   use: { ...devices['iPad Pro'] } },
  ],
  webServer: [
    {
      command: 'docker-compose up',
      url: 'http://localhost:8000/docs',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

### Playwright 실행 명령어

```bash
# 전체 E2E 테스트 실행
npx playwright test

# 특정 스프린트 시나리오만 실행
npx playwright test auth.spec.ts
npx playwright test defects.spec.ts
npx playwright test analysis-pipeline.spec.ts

# UI 모드 (인터랙티브 디버깅)
npx playwright test --ui

# 리포트 확인
npx playwright show-report
```

---

## 우선순위 매트릭스

```
높음 │  [S1-B5] 유사결함API   [S3-B1] 영향도 분석
     │  [S2-B6] ML싱글톤      [S3-B2] TC생성
영향 │
도   │  [S1-F4] 인증상태      [S5-B1] pgvector
     │  [S4-B1] Redmine연동   [S9-B1] 부하테스트
낮음 │  [S6-B2] 이메일알림    [S8-B2] PDF보고서
     └────────────────────────────────────────
         낮음       구현 난이도       높음
```

---

## 기술 부채 관리

| 항목 | 발생 시점 | 해소 목표 |
|------|----------|----------|
| JSON 배열 임베딩 저장 → pgvector | R1 MVP | Sprint 5 |
| 인메모리 유사도 계산 (전수 비교) → ANN | R1 MVP | Sprint 5 |
| 더미 데이터 하드코딩 → Redmine 연동 | R1 MVP | Sprint 4 |
| 단순 템플릿 TC 생성 → LLM 기반 | R1 MVP | Sprint 5 |
| 단일 서버 → 수평 확장 (K8s) | R2 | Sprint 9 |

---

*최종 업데이트: 2026-03-13 | 버전: 1.0.0*
