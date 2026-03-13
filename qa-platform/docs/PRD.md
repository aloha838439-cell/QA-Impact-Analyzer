# PRD — QA Impact Analyzer
## AI 기반 영향도 분석 및 테스트케이스 추천 시스템

> **버전**: 1.0.0 | **최종 업데이트**: 2026-03-13
> **문서 상태**: 승인됨 (Approved)

---

## 1. 역할 정의

본 프로젝트의 Product Owner는 소프트웨어 품질 보증(QA) 도메인에 대한 깊은 이해를 바탕으로, AI 기반의 영향도 분석 및 테스트케이스 추천 시스템 개발을 책임지는 시니어 풀스택 개발자 출신입니다.

**핵심 개발 원칙**:
- 클린 코드 (Clean Code)
- 테스트 가능성 (Testability)
- 확장성 (Scalability)

---

## 2. 프로젝트 컨텍스트

### 2.1 해결하고자 하는 문제

QA 전문가들이 겪는 핵심 문제:

1. **영향도 분석 비효율**: 신규 기능 추가 또는 수정 시 기존 시스템에 미치는 영향도 분석 및 유사 오류 검색에 많은 시간이 소요된다.
2. **경험 의존적 테스트**: 신규 테스트 케이스 작성 시 개인의 경험에 과도하게 의존하여 테스트 누락 위험이 발생한다.

### 2.2 타겟 고객

소프트웨어, 웹, 모바일 앱 등 제품의 품질을 검증하고 개선하는 **QA 전문가**.

**주요 니즈**:
- 테스트 프로세스 자동화 및 효율성 증대
- 결함 관리 및 추적의 용이성
- 테스트 결과에 대한 명확한 분석 및 리포팅

**얼리어답터**: 새로운 테스트 방법론이나 도구 도입에 적극적인 기술 주도 기업의 QA 리드 또는 매니저.

### 2.3 고유 가치 제안 (UVP)

> "기존 시스템 변경 시 과거 오류 데이터 기반으로 영향도를 분석하고 필요한 테스트 및 테스트케이스를 자동 추천하여 품질 검증 프로세스를 혁신합니다."

**차별화 포인트**:
- 수동 영향도 분석의 한계 극복
- 경험 의존적 테스트 범위 판단 탈피
- 과거 오류 데이터를 활용한 자동화된 영향도 분석
- 테스트케이스 자동 제안

### 2.4 궁극적 목표

- QA 프로세스 비효율성 해소
- 시스템 변경에 따른 잠재적 위험 최소화
- 빠르고 정확한 이슈 진단 및 배포 안정성 확보
- QA 팀의 생산성과 시스템 완성도 극대화

---

## 3. 기능 요구사항

### 3.1 핵심 기능 (MVP — P0)

#### [P0] 유사 결함 조회 기능

| 항목 | 내용 |
|------|------|
| **목적** | 신규 변경 사항과 유사한 과거 결함을 자동으로 찾아 잠재적 리스크를 예측한다 |
| **입력** | 신규 변경 사항 (기능 명세, 코드 변경 요약 등) 자유 텍스트 |
| **출력** | 유사성 높은 과거 결함 목록 (Top-N) |
| **결함 표시 항목** | 간단한 요약, 발생일, 심각도, 관련 기능 정보 |
| **사용자 목표** | 조회된 결함 목록을 통해 잠재적 문제와 리스크를 예측 |

#### [P0] 변경 영향도 분석 기능

| 항목 | 내용 |
|------|------|
| **목적** | 신규 변경 사항이 기존 시스템에 미치는 영향을 정량화하고 시각화한다 |
| **입력** | 신규 변경 사항 + 관련 시스템 컴포넌트/모듈/기능 영역 지정 |
| **출력** | 영향 범위, 관련 기능 목록, 잠재적 side effect 경고 (시각화 형태) |
| **분석 기반** | 과거 결함 데이터 및 시스템 구조 정보 |

#### [P0] 테스트케이스 자동 제안 기능

| 항목 | 내용 |
|------|------|
| **목적** | 영향도 분석 결과를 기반으로 필요한 테스트케이스를 자동 생성한다 |
| **입력** | 영향도 분석 결과 + 신규 변경 사항 |
| **출력** | 구체적인 테스트케이스 목록 |
| **테스트케이스 구성 요소** | 테스트 목적, 예상 결과, 테스트 절차 |
| **사용자 상호작용** | 제안된 테스트케이스 검토, 수정, 추가 가능한 인터페이스 |

---

### 3.2 일반 기능

#### [P1] 사용자 인증 및 권한 관리

- 사용자는 계정을 생성하고 로그인할 수 있다.
- 시스템은 사용자별로 접근 가능한 기능 및 데이터를 제어할 수 있다.
  - 역할: QA 팀원, QA 리더

#### [P1] 반응형 웹 디자인

- 다양한 디바이스(데스크톱, 태블릿)에서 최적화된 화면으로 서비스를 이용할 수 있다.

#### [P1] 데이터 연동 (초기)

- 과거 결함 데이터를 초기 적재할 수 있는 인터페이스 (파일 업로드) 제공
- MVP에서는 수동 업로드 또는 더미 데이터 사용
- (향후) Redmine 등 외부 결함 관리 시스템과의 API 연동을 통해 결함 데이터 자동 동기화

#### [P2] 알림 기능

- 중요한 영향도 분석 결과나 테스트케이스 제안 완료 시 사용자에게 알림 제공

#### [P2] 대시보드

- 현재 진행 중인 분석 현황
- 최근 제안된 테스트케이스
- 시스템 완성도 관련 지표 (분석 후 결함 발생률 변화 등)

---

## 4. 기술 제약사항

### 4.1 배포 환경

클라우드 기반의 웹 애플리케이션 형태로 개발 (AWS, GCP, Azure 등)

### 4.2 성능 요구사항

| 기능 | 응답시간 요구사항 |
|------|-----------------|
| 유사 결함 조회 | ≤ 5초 |
| 변경 영향도 분석 | ≤ 5초 |
| 테스트케이스 자동 제안 | ≤ 10초 |
| 동시 사용자 지원 | 100명까지 안정적인 응답 시간 유지 |

### 4.3 데이터 처리

과거 결함 데이터의 양이 많을 수 있으므로, 효율적인 데이터 저장 및 검색, 분석 기술이 필요하다.

### 4.4 보안 요구사항

- 모든 사용자 데이터 및 결함 정보는 암호화되어 저장 및 전송되어야 한다.
- SQL Injection, XSS 등 웹 취약점 공격에 대비한 보안 조치를 적용해야 한다.
- 사용자 인증 및 권한 관리를 위한 강력한 보안 메커니즘을 구현해야 한다.

### 4.5 권장 기술 스택

| 영역 | 권장 기술 |
|------|----------|
| **Frontend** | React, Vue.js, 또는 Angular (TypeScript 권장) |
| **Backend** | Python (Django/Flask) 또는 Node.js (Express) |
| **AI/ML** | Python + Pandas, Scikit-learn, TensorFlow/PyTorch |
| **Database** | PostgreSQL 또는 MySQL (NoSQL: Elasticsearch, MongoDB 검토 가능) |
| **AI 기법** | NLP — 키워드 매칭, 임베딩 벡터 비교, Seq2Seq 모델 |

> **현재 구현 선택**: FastAPI + React 18 + TypeScript + PostgreSQL + sentence-transformers (`paraphrase-multilingual-MiniLM-L12-v2`)

---

## 5. 산출물 구조

```
qa-platform/
├── README.md
├── ROADMAP.md
├── .env.example
├── docker-compose.yml
├── backend/
│   ├── src/
│   │   ├── main.py                         # 애플리케이션 진입점, API 라우팅
│   │   ├── app/
│   │   │   ├── auth.py                     # JWT 인증 유틸리티
│   │   │   ├── database.py                 # DB 연결 및 세션
│   │   │   └── routers/
│   │   │       ├── auth.py                 # POST /api/auth/register, /login
│   │   │       ├── defects.py              # 결함 CRUD, CSV 업로드
│   │   │       └── analysis.py             # 유사결함, 영향도, TC 제안
│   │   ├── models/                         # SQLAlchemy ORM 모델
│   │   ├── services/
│   │   │   ├── similarity_service.py       # 유사도 분석 서비스
│   │   │   ├── impact_service.py           # 영향도 분석 비즈니스 로직
│   │   │   ├── test_case_service.py        # 테스트케이스 자동 제안
│   │   │   └── defect_service.py           # 결함 데이터 관리
│   │   ├── ml_models/
│   │   │   └── similarity_model.py         # SentenceTransformer 래퍼
│   │   ├── config/
│   │   │   └── settings.py                 # 환경변수 설정
│   │   └── utils/
│   │       └── seed_data.py                # 더미 결함 데이터 20건
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx                         # 라우팅 설정
│   │   ├── components/
│   │   │   ├── Layout/                     # Sidebar, Header, ProtectedRoute
│   │   │   ├── UI/                         # Badge, Card, LoadingSpinner, ProgressBar
│   │   │   ├── DefectList/
│   │   │   │   └── BugListComponent.tsx    # 유사 결함 목록 표시
│   │   │   ├── Analysis/
│   │   │   │   └── ImpactVisualization.tsx # 영향도 게이지 + 영향 영역
│   │   │   └── TestCases/
│   │   │       └── TestCaseCard.tsx        # TC 카드 + 인라인 편집
│   │   ├── pages/
│   │   │   ├── ImpactAnalysisPage.tsx      # 메인 분석 페이지
│   │   │   ├── DefectsPage.tsx             # 결함 관리 페이지
│   │   │   ├── DashboardPage.tsx           # 대시보드
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── services/                       # API 클라이언트 레이어
│   │   ├── store/                          # Zustand 상태 관리
│   │   ├── types/                          # TypeScript 인터페이스
│   │   └── utils/                          # 포맷터 등 유틸
│   ├── tests/
│   │   └── e2e/                            # Playwright E2E 시나리오
│   ├── package.json
│   └── Dockerfile
└── docs/
    ├── PRD.md                              # 본 문서
    ├── ROADMAP.md                          # Agile 로드맵
    ├── api.md                              # API 엔드포인트 명세
    └── database_schema.md                  # DB 스키마 문서
```

---

## 6. API 엔드포인트 명세

### 결함 데이터 관리

| Method | Endpoint | 설명 | 우선순위 |
|--------|----------|------|----------|
| `POST` | `/api/defects/upload` | 과거 결함 데이터 CSV 업로드 | P1 |
| `GET` | `/api/defects` | 전체 결함 조회 (페이지네이션, 필터) | P1 |
| `GET` | `/api/defects/{id}` | 특정 결함 단건 조회 | P1 |
| `POST` | `/api/defects/seed` | 더미 데이터 주입 (개발용) | Dev |

### 유사 결함 조회

```
POST /api/analysis/similar-defects

Request:
{
  "change_description": "신규 변경 내용 설명"
}

Response:
[
  {
    "id": "uuid",
    "title": "결함 제목",
    "severity": "High",
    "description": "요약",
    "similarity_score": 0.87,
    "related_features": ["auth", "session"]
  }
]
```

### 변경 영향도 분석

```
POST /api/analysis/impact

Request:
{
  "change_description": "신규 변경 내용 설명",
  "affected_modules": ["ModuleA", "ModuleB"]
}

Response:
{
  "impact_score": 0.85,
  "affected_areas": ["FunctionX", "ServiceY"],
  "potential_side_effects": ["DB 락 발생 가능성", "성능 저하"]
}
```

### 테스트케이스 자동 제안

```
POST /api/analysis/test-cases

Request:
{
  "impact_analysis_result_id": "uuid",
  "change_description": "신규 변경 내용 설명"
}

Response:
[
  {
    "id": "uuid",
    "title": "테스트케이스 제목",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "expected_result": "기대 결과"
  }
]
```

---

## 7. 데이터 모델

```sql
-- 과거 결함 데이터
CREATE TABLE defects (
    id               UUID PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    severity         VARCHAR(50),          -- Critical | High | Medium | Low
    reported_date    TIMESTAMP,
    related_features TEXT[],               -- 관련 기능 목록
    status           VARCHAR(50),          -- Open | Closed | In Progress
    embedding        JSONB                 -- 임베딩 벡터 (향후 pgvector 전환)
);

-- 신규 변경 사항
CREATE TABLE changes (
    id             UUID PRIMARY KEY,
    description    TEXT NOT NULL,
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitter_id   UUID REFERENCES users(id)
);

-- 영향도 분석 결과
CREATE TABLE impact_analyses (
    id                   UUID PRIMARY KEY,
    change_id            UUID REFERENCES changes(id),
    analysis_date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    impact_score         DECIMAL(5,2),     -- 0.00 ~ 1.00
    affected_areas       TEXT[],
    potential_side_effects TEXT[],
    status               VARCHAR(50)       -- PENDING | COMPLETED | FAILED
);

-- 제안된 테스트케이스
CREATE TABLE test_cases (
    id                   UUID PRIMARY KEY,
    impact_analysis_id   UUID REFERENCES impact_analyses(id),
    title                VARCHAR(255) NOT NULL,
    description          TEXT,
    steps                TEXT[],
    expected_result      TEXT,
    suggested_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by_ai      BOOLEAN DEFAULT TRUE
);

-- 사용자
CREATE TABLE users (
    id              UUID PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    name            VARCHAR(100),
    role            VARCHAR(50) DEFAULT 'qa_member', -- qa_member | qa_lead | admin
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. 코딩 컨벤션

| 항목 | 규칙 |
|------|------|
| **변수명 (JS/TS)** | `camelCase` |
| **변수명 (Python)** | `snake_case` |
| **클래스명** | `PascalCase` |
| **코드 포맷 (JS)** | Prettier |
| **코드 포맷 (Python)** | Black |
| **문서화** | 중요 함수/클래스/API에 docstring 또는 JSDoc 필수 |

---

## 9. 단계별 구현 가이드

### Phase 1 — MVP (Week 1–6)

**목표**: "과거 오류 데이터 기반 영향도 분석 및 테스트케이스 자동 추천" 핵심 가치 제안 구현

**포함 기능**:
- [P0] 과거 결함 데이터 초기 적재 (수동 업로드 / 더미 데이터)
- [P0] 유사 결함 조회 (키워드 매칭 또는 임베딩 기반)
- [P0] 변경 영향도 분석 (과거 결함-기능 연관성 기반 추론)
- [P0] 테스트케이스 자동 제안 (템플릿 기반 또는 유사 결함 변형)
- [P1] 사용자 인증 및 기본 권한 관리
- [P1] 반응형 웹 UI (데스크톱 / 태블릿)

**완료 조건 체크리스트**:
- [ ] 과거 결함 데이터가 성공적으로 시스템에 적재된다
- [ ] 유사 결함 목록이 5초 이내에 제시된다
- [ ] 영향도 분석 결과가 5초 이내에 시각적으로 제공된다
- [ ] 최소 3개 이상의 의미 있는 테스트케이스가 자동 제안된다
- [ ] 로그인/로그아웃 기능 정상 작동, 권한 없는 사용자 접근 차단
- [ ] 데스크톱/태블릿 환경에서 레이아웃 정상 표시

**핵심 지표**: Phase 1 완료 후 1개월 내 Side effect 발생률 **10% 감소** 목표

---

### Phase 2 — 기능 확장 및 AI/ML 고도화 (Week 7–12)

**포함 기능**:
- [P1] Redmine 등 외부 결함 관리 시스템 API 연동 (자동 동기화)
- [P1] 영향도 분석 및 테스트케이스 제안 AI/ML 모델 고도화 (딥러닝 NLP)
- [P1] 사용자가 제안된 테스트케이스를 직접 편집/저장
- [P2] 대시보드 — 핵심 지표(시스템 완성도, 테스트케이스 활용률) 시각화
- [P2] 알림 시스템 — 분석 완료 시 푸시 알림 또는 이메일 알림

**핵심 지표**:
- Side effect 감소율 **20%** 달성
- 테스트케이스 활용률 (자동 제안 중 실제 사용 비율) **70% 이상**

---

### Phase 3 — 사용자 경험 강화 및 확장 (Week 13–18)

**포함 기능**:
- [P2] 개인화 추천 — 사용자 과거 활동 기반 맞춤형 결함/TC 추천
- [P2] 보고서 생성 — 영향도 분석 및 TC 제안 결과 기반 QA 보고서 자동 생성
- [P2] 협업 기능 — 팀원 간 분석 결과 및 테스트케이스 공유, 코멘트

**핵심 지표**:
- Side effect 감소율 **30%** 달성
- 사용자 만족도(NPS) 측정 및 UX 개선 효과 검증

---

## 10. 성공 지표 요약

| 지표 | Phase 1 목표 | Phase 2 목표 | Phase 3 목표 |
|------|-------------|-------------|-------------|
| Side effect 감소율 | 10% | 20% | 30% |
| 테스트케이스 활용률 | 측정 시작 | 70% | 70%+ 유지 |
| 분석 응답시간 P95 | ≤ 5초 | ≤ 2초 | ≤ 2초 |
| 동시 사용자 지원 | 10명 | 50명 | 100명 |
| 사용자 만족도 NPS | — | — | ≥ 40 |
