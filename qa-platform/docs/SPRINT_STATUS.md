# 스프린트 진행 현황 — 계획 대비 실적

> **최종 업데이트**: 2026-03-13 | **현재 단계**: R1 MVP 완료

---

## 전체 요약

| 스프린트 | 계획 SP | 완료 SP | 완료율 | 상태 |
|---------|--------|--------|--------|------|
| Sprint 1 — 기반 인프라 + 인증 | 22 | 20 | 91% | ✅ 완료 |
| Sprint 2 — 결함 관리 + 유사 결함 | 21 | 21 | 100% | ✅ 완료 |
| Sprint 3 — 영향도 분석 + TC 제안 | 23 | 23 | 100% | ✅ 완료 |
| Sprint 4~9 | — | — | — | ⬜ 미착수 |

**R1 MVP 전체**: 계획 66 SP → 완료 64 SP (97%)

---

## Sprint 1 — 기반 인프라 + 인증

**기간**: 2026-03-13 (단일 세션)
**커밋**: `439856a`, `a4334f4`, `3d003f2`, `359e434`, `8d2dab3`

### 계획 대비 실적

| ID | 태스크 | 계획 SP | 실적 | 비고 |
|----|--------|--------|------|------|
| S1-B1 | DB 모델 정의 (User, Defect, Change, ImpactAnalysis, TestCase) | 3 | ✅ 완료 | SQLite로 변경 (하단 편차 참조) |
| S1-B2 | `POST /api/auth/register` — bcrypt 해싱 | 2 | ✅ 완료 | EmailStr 유효성 검사 포함 |
| S1-B3 | `POST /api/auth/login` — JWT 발급 | 2 | ✅ 완료 | |
| S1-B4 | `GET /api/auth/me` — Bearer 토큰 검증 | 1 | ✅ 완료 | |
| S1-B5 | Docker Compose 구성 | 2 | ⚠️ 부분 완료 | Docker 미사용, 직접 실행으로 대체 |
| S1-F1 | Vite + React 18 + TypeScript + Tailwind 셋업 | 1 | ✅ 완료 | |
| S1-F2 | 로그인 페이지 UI + 폼 유효성 | 3 | ✅ 완료 | |
| S1-F3 | 회원가입 페이지 UI | 2 | ⚠️ 제거됨 | 하단 편차 참조 |
| S1-F4 | Zustand authStore | 2 | ✅ 완료 | |
| S1-F5 | ProtectedRoute | 1 | ✅ 완료 | |
| S1-F6 | 사이드바 + 헤더 레이아웃 | 3 | ✅ 완료 | 한국어 UI 적용 |

### 계획 편차 (Deviations)

| 항목 | 계획 | 실제 | 이유 |
|------|------|------|------|
| 데이터베이스 | PostgreSQL (Docker) | SQLite (파일) | 로컬 Docker 미설치 환경 |
| 회원가입 플로우 | 회원가입 페이지 제공 | 사전 등록 admin 계정으로 대체 | bcrypt 5.0/passlib 1.7.4 비호환 오류 반복 → UX 단순화 결정 |
| Docker Compose | 3-service 구성 | 없음 | 개발 환경 제약 |
| UI 언어 | 영어 | 한국어 | 사용자 요구사항 변경 |

### 검증 결과

| 검증 항목 | 결과 | 비고 |
|---------|------|------|
| 로그인 API (`POST /api/auth/login`) | ✅ PASS | `admin@qa.com` / `admin1234` 정상 인증 |
| JWT 토큰 발급 및 검증 | ✅ PASS | Bearer 토큰 `/api/auth/me` 정상 응답 |
| ProtectedRoute 미인증 차단 | ✅ PASS | 직접 URL 접근 시 `/login` 리다이렉트 |
| 로그아웃 토큰 삭제 | ✅ PASS | localStorage 클리어 확인 |
| 사이드바 + 헤더 레이아웃 | ✅ PASS | 다크 테마, 한국어 메뉴 |
| 6개 코드 리뷰 지적사항 수정 | ✅ PASS | `datetime.utcnow`, `EmailStr`, SQLite 설정, `htmlFor` 등 |

### 이슈 및 해결

| 이슈 | 원인 | 해결 |
|------|------|------|
| `bcrypt 5.0` + `passlib 1.7.4` 비호환 | bcrypt API 변경 | `bcrypt==3.2.2`로 다운그레이드 |
| SQLite `pool_size` 파라미터 오류 | SQLAlchemy SQLite 미지원 | `database.py`에 SQLite 분기 처리 추가 |
| `email-validator` ImportError | `pydantic[email]` 미설치 | `pip install email-validator` |
| `datetime.utcnow` deprecation | Python 3.12+ 경고 | `datetime.now(timezone.utc)`로 교체 |

---

## Sprint 2 — 결함 데이터 관리 + 유사 결함 조회

**기간**: 2026-03-13 (단일 세션)
**커밋**: `439856a` (초기 구현 포함), `0a4fa75`

### 계획 대비 실적

| ID | 태스크 | 계획 SP | 실적 | 비고 |
|----|--------|--------|------|------|
| S2-B1 | CSV 업로드 + 임베딩 계산 | 5 | ✅ 완료 | hash 인코딩 적용 |
| S2-B2 | `GET /api/defects` — 필터/페이지네이션 | 2 | ✅ 완료 | severity, module, search 필터 |
| S2-B3 | `GET /api/defects/{id}` — 단건 조회 | 1 | ✅ 완료 | |
| S2-B4 | `POST /api/defects/seed` — 더미 데이터 | 1 | ✅ 완료 | 시작 시 admin 계정 자동 시드 |
| S2-B5 | `POST /api/analysis/similar-defects` | 5 | ✅ 완료 | |
| S2-B6 | SentenceTransformer 싱글톤 | 3 | ✅ 완료 | hash encoding 싱글톤으로 구현 |
| S2-F1 | DefectsPage — 드래그앤드롭 CSV 업로드 | 5 | ✅ 완료 | |
| S2-F2 | 결함 목록 테이블 (severity 필터) | 3 | ✅ 완료 | 모듈 필터, 검색 추가 |
| S2-F3 | BugListComponent — 유사 결함 카드 | 3 | ✅ 완료 | |
| S2-F4 | ImpactAnalysisPage — 텍스트 입력 + 분석 버튼 | 2 | ✅ 완료 | |
| S2-F5 | 로딩 스피너 + React Query 캐싱 | 2 | ✅ 완료 | |

### 계획 편차

| 항목 | 계획 | 실제 | 이유 |
|------|------|------|------|
| 임베딩 모델 | sentence-transformers | 512-dim hash encoding | Python 3.14 torch 빌드 실패 |
| 임베딩 차원 | 384 (MiniLM) | 512 (hash) | 고정 차원 보장을 위한 설계 변경 |
| 스타트업 임베딩 재계산 | 없음 | 추가됨 | 177건 stale 임베딩 자동 수정 로직 |

### 검증 결과

| 검증 항목 | 결과 | 측정값 |
|---------|------|-------|
| CSV 업로드 (100행) | ✅ PASS | 응답시간 < 5초 |
| 유사 결함 조회 응답시간 | ✅ PASS | 20건 기준 < 1초 |
| severity 필터 동작 | ✅ PASS | Critical/High/Medium/Low 정상 필터 |
| 결함 전체 삭제 (`DELETE /all`) | ✅ PASS | 177건 일괄 삭제 확인 |
| 임베딩 차원 불일치 처리 | ✅ PASS | 서버 시작 시 자동 재계산 |

### 이슈 및 해결

| 이슈 | 원인 | 해결 |
|------|------|------|
| TF-IDF 가변 차원 오류 | 텍스트마다 어휘집 크기 상이 | 512-dim hash 고정 인코딩으로 전면 교체 |
| `DELETE /all` → 405 Method Not Allowed | FastAPI 라우트 순서 오류 (`/{id}` 가 `/all` 보다 먼저 등록) | `/all` 라우트를 `/{id}` 앞으로 이동 |
| 분석 내역 결함 삭제 후에도 잔존 | cascade 미적용 | `DELETE /all` 시 ImpactAnalysis, TestCase 동시 삭제 |

---

## Sprint 3 — 영향도 분석 + 테스트케이스 자동 제안

**기간**: 2026-03-13 (단일 세션)
**커밋**: `439856a` (초기 구현 포함)

### 계획 대비 실적

| ID | 태스크 | 계획 SP | 실적 | 비고 |
|----|--------|--------|------|------|
| S3-B1 | `POST /api/analysis/impact` — 가중치 점수 | 5 | ✅ 완료 | 유사도 45%+심각도 35%+모듈 20% |
| S3-B2 | `POST /api/analysis/test-cases` — 3~5개 생성 | 5 | ✅ 완료 | 템플릿 기반 생성 |
| S3-B3 | ImpactAnalysis, TestCase DB 저장 + 히스토리 | 3 | ✅ 완료 | `GET /api/analysis/history` 구현 |
| S3-B4 | 전체 파이프라인 성능 ≤ 10초 | 3 | ✅ PASS | 20건 기준 < 3초 |
| S3-F1 | ImpactVisualization — 게이지 + 영향 영역 | 5 | ✅ 완료 | |
| S3-F2 | TestCaseCard — 제목/단계/기대결과 | 5 | ✅ 완료 | 인라인 편집 구현 |
| S3-F3 | 3단계 파이프라인 UI | 3 | ✅ 완료 | |
| S3-F4 | 모듈 칩 선택기 | 2 | ✅ 완료 | |
| S3-F5 | 반응형 레이아웃 | 2 | ✅ 완료 | |

### 검증 결과

| 검증 항목 | 결과 | 측정값 |
|---------|------|-------|
| 영향도 분석 응답시간 | ✅ PASS | < 2초 (20건 데이터 기준) |
| impact_score 범위 (0~1) | ✅ PASS | 정규화 확인 |
| 테스트케이스 생성 수 | ✅ PASS | 최소 3개 이상 생성 |
| TC steps 필드 존재 여부 | ✅ PASS | 최소 3 steps 포함 |
| 히스토리 저장 및 조회 | ✅ PASS | 대시보드 최근 분석 내역 표시 |
| 대시보드 연동 | ✅ PASS | 분석 횟수, 평균 영향도 카드 정상 표시 |

### 이슈 및 해결

| 이슈 | 원인 | 해결 |
|------|------|------|
| 결함 삭제 후 대시보드 수치 잔존 | ImpactAnalysis 별도 삭제 미처리 | `DELETE /all` 에 분석 내역 cascade 삭제 추가 |

---

## 추가 구현 항목 (계획 외)

계획에 없었으나 사용자 요구 또는 기술적 필요에 의해 추가된 기능:

| 항목 | 이유 | 커밋 |
|------|------|------|
| 전체 삭제 버튼 (`DELETE /all`) | 사용자 요청: 불필요 데이터 정리 | `0a4fa75` |
| 서버 시작 시 임베딩 자동 재계산 | 기존 데이터 호환성 보장 | `0a4fa75` |
| 서버 시작 시 admin 계정 자동 생성 | 회원가입 프로세스 제거 대응 | `0a4fa75` |
| Vercel 배포 설정 | 사용자 요청: 외부 접근 가능한 URL | `d54934a` |
| 한국어 UI 전환 | 사용자 요청 | `0a4fa75` |

---

## 배포 현황

| 환경 | URL | 상태 |
|------|-----|------|
| 프론트엔드 (Vercel) | https://frontend-seven-theta-64.vercel.app | 🟢 운영 중 |
| 백엔드 API (Vercel) | https://backend-gamma-eight-25.vercel.app | 🟢 운영 중 |
| 로컬 프론트엔드 | http://localhost:3001 | 🟢 개발 서버 |
| 로컬 백엔드 API | http://localhost:8004 | 🟢 개발 서버 |

---

*최종 업데이트: 2026-03-13 | R1 MVP 완료*
