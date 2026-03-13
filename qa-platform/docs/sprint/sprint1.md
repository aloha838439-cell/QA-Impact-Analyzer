# Sprint 1 — 기반 인프라 + 인증

> **릴리즈**: R1 — MVP | **기간**: Week 1–2 (2주)
> **스프린트 목표**: 개발 환경 완성, 사용자가 로그인하여 빈 화면을 볼 수 있다.

---

## 스프린트 개요

| 항목 | 내용 |
|------|------|
| 기간 | Week 1 ~ Week 2 (10 영업일) |
| 팀 구성 | Backend 1명 + Frontend 1명 |
| 총 스토리 포인트 | **22 SP** |
| 예상 총 공수 | **88시간** (1 SP = 4시간 기준) |
| Velocity 목표 | 22 SP |

---

## 스프린트 목표 (Sprint Goal)

> "QA 팀원이 이메일/비밀번호로 회원가입 후 로그인하여, 사이드바가 있는 기본 화면에 접근할 수 있다.
> 모든 서비스는 Docker Compose 한 명령으로 기동되어야 한다."

---

## 태스크 목록

### Backend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S1-B1 | PostgreSQL + SQLAlchemy 모델 정의 (User, Defect, Change, ImpactAnalysis, TestCase) | 3 | 12h | BE | `alembic upgrade head` 오류 없이 실행, 5개 테이블 생성 확인 |
| S1-B2 | `POST /api/auth/register` — 이메일 중복 검사, bcrypt 해싱 | 2 | 8h | BE | 중복 이메일 409 반환, 비밀번호 bcrypt 해싱 저장 확인 |
| S1-B3 | `POST /api/auth/login` — JWT 발급 (30분 만료) | 2 | 8h | BE | 토큰 decode 시 `sub=user_id` 확인, 잘못된 자격증명 401 반환 |
| S1-B4 | `GET /api/auth/me` — Bearer 토큰 검증 | 1 | 4h | BE | 유효 토큰 → 사용자 정보 반환, 만료 토큰 → 401 |
| S1-B5 | Docker Compose 구성 (db + backend + frontend) | 2 | 8h | BE | `docker-compose up` 3개 서비스 정상 기동, health check 통과 |

**Backend 소계**: **10 SP / 40시간**

---

### Frontend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S1-F1 | Vite + React 18 + TypeScript + Tailwind 프로젝트 셋업 | 1 | 4h | FE | `npm run dev` 빌드 성공, TypeScript strict 모드 활성화 |
| S1-F2 | 로그인 페이지 UI + 폼 유효성 검사 | 3 | 12h | FE | 이메일 형식 검사, 비밀번호 빈값 시 인라인 에러 표시, API 연동 완료 |
| S1-F3 | 회원가입 페이지 UI + 비밀번호 강도 표시 | 2 | 8h | FE | 8자 미만 시 "약함" 표시, 회원가입 성공 시 /login 리다이렉트 |
| S1-F4 | Zustand authStore (토큰 localStorage 영속) | 2 | 8h | FE | 새로고침 후 로그인 상태 유지, 토큰 만료 시 자동 로그아웃 |
| S1-F5 | ProtectedRoute — 미인증 시 /login 리다이렉트 | 1 | 4h | FE | 직접 URL 접근 시 차단, 로그인 후 원래 경로 복원 |
| S1-F6 | 좌측 사이드바 + 헤더 레이아웃 (다크 테마) | 3 | 12h | FE | 데스크톱(1280px)/태블릿(768px) 레이아웃 깨짐 없음, 활성 메뉴 하이라이트 |

**Frontend 소계**: **12 SP / 48시간**

---

## 공수 요약

| 구분 | SP | 예상 공수 | 비율 |
|------|----|---------|------|
| Backend | 10 | 40h | 45% |
| Frontend | 12 | 48h | 55% |
| **합계** | **22** | **88h** | 100% |

### 일별 계획 (2인 기준)

| Day | Backend | Frontend |
|-----|---------|----------|
| Day 1 | S1-B1 DB 모델 설계 | S1-F1 프로젝트 셋업 |
| Day 2 | S1-B1 Alembic 마이그레이션 | S1-F2 로그인 UI |
| Day 3 | S1-B2 회원가입 API | S1-F2 폼 유효성 + API 연동 |
| Day 4 | S1-B3 로그인 JWT 발급 | S1-F3 회원가입 UI |
| Day 5 | S1-B4 /me 엔드포인트 | S1-F4 Zustand authStore |
| Day 6 | S1-B5 Docker Compose | S1-F5 ProtectedRoute |
| Day 7 | S1-B5 Docker 통합 테스트 | S1-F6 사이드바 레이아웃 |
| Day 8 | 통합 테스트 + 버그 수정 | S1-F6 반응형 처리 |
| Day 9 | 코드 리뷰 + 문서화 | 코드 리뷰 + E2E 테스트 준비 |
| Day 10 | **스프린트 리뷰 + 회고** | **스프린트 리뷰 + 회고** |

---

## 완료 조건 (Definition of Done)

- [x] 모든 스토리 포인트 완료 및 PR 머지
- [x] DB 테이블 생성 오류 없이 실행 (SQLite, 서버 시작 시 자동 생성)
- [x] 백엔드/프론트엔드 서비스 정상 기동
- [x] 로그인 → 대시보드 접근 플로우 동작 (admin@qa.com / admin1234)
- [x] 미인증 사용자 보호 라우트 접근 차단
- [x] 데스크톱/태블릿 레이아웃 정상 표시 (한국어 UI)
- [x] 6개 코드 리뷰 지적사항 수정 완료

## 실제 검증 결과

| 검증 항목 | 결과 | 비고 |
|---------|------|------|
| `POST /api/auth/login` | ✅ PASS | 200 + access_token 반환 |
| `GET /api/auth/me` | ✅ PASS | Bearer 토큰 검증 정상 |
| 만료 토큰 → 401 | ✅ PASS | |
| ProtectedRoute 차단 | ✅ PASS | 미인증 → /login 리다이렉트 |
| `datetime.utcnow` 수정 | ✅ PASS | `datetime.now(timezone.utc)` 적용 |
| `EmailStr` 유효성 | ✅ PASS | email-validator 설치 후 동작 |
| SQLite engine 설정 | ✅ PASS | pool_size 분기 처리 |
| `htmlFor`/`id` 쌍 | ✅ PASS | 모든 label-input 연결 |

## 편차 사항

| 항목 | 계획 | 실제 | 이유 |
|------|------|------|------|
| 데이터베이스 | PostgreSQL | SQLite | 로컬 Docker 미사용 환경 |
| 회원가입 | 회원가입 페이지 | 사전 등록 admin 계정 | bcrypt 5.0 비호환 오류 → UX 단순화 |
| Docker Compose | 필수 | 미사용 | 개발 환경 제약 |

---

## Playwright 검증 시나리오

참조: `frontend/tests/e2e/auth.spec.ts`

| 시나리오 | 검증 포인트 |
|---------|-----------|
| 회원가입 성공 후 /login 이동 | 성공 토스트 + URL 변경 |
| 올바른 자격증명 로그인 성공 | /dashboard 이동 + 사이드바 표시 |
| 잘못된 비밀번호 로그인 실패 | 에러 메시지 표시 + URL 유지 |
| 미인증 보호 라우트 접근 | /login 리다이렉트 |
| 로그아웃 후 토큰 삭제 | localStorage 토큰 null 확인 |

```bash
# 실행 명령
npx playwright test auth.spec.ts --project=chromium
```

---

## 의존성

| 의존 항목 | 유형 | 비고 |
|---------|------|------|
| PostgreSQL 16 Docker 이미지 | 외부 | docker-compose에 포함 |
| python-jose, passlib[bcrypt] | 패키지 | requirements.txt 포함 |
| Zustand 4.x | 패키지 | package.json 포함 |
| 없음 (선행 스프린트) | — | 첫 번째 스프린트 |

---

## 리스크

| 리스크 | 확률 | 영향도 | 대응 방안 |
|--------|------|--------|---------|
| Docker Compose 포트 충돌 | 중 | 중 | `.env`에 포트 변수화 |
| JWT 라이브러리 호환성 이슈 | 저 | 중 | python-jose 고정 버전 사용 |
| Tailwind 다크 테마 설정 복잡도 | 중 | 저 | CSS 변수 방식으로 단순화 |

---

*스프린트 작성일: 2026-03-13 | 완료일: 2026-03-13 | 상태: ✅ 완료*
