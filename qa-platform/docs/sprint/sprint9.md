# Sprint 9 — 성능 + 안정성 + 보안 감사

> **릴리즈**: R3 — Scale | **기간**: Week 17–18 (2주)
> **스프린트 목표**: 동시 사용자 100명 안정적 처리, Redis 캐싱 도입, 전체 보안 감사 완료.

---

## 스프린트 개요

| 항목 | 내용 |
|------|------|
| 기간 | Week 17 ~ Week 18 (10 영업일) |
| 팀 구성 | Backend 1명 + Frontend 1명 + (선택) DevOps 지원 |
| 총 스토리 포인트 | **20 SP** |
| 예상 총 공수 | **80시간** (1 SP = 4시간 기준) |
| Velocity 목표 | 20 SP |
| 선행 스프린트 | Sprint 1~8 (R1+R2+R3 前) 완료 필수 |

---

## 스프린트 목표 (Sprint Goal)

> "동시 사용자 100명 P95 응답시간 5초 이내를 달성하고,
> Redis 캐싱으로 임베딩 연산을 최소화하며,
> OWASP Top 10 기반 보안 감사를 통과하고,
> NPS 설문 위젯으로 사용자 만족도 측정을 시작한다."

---

## 태스크 목록

### Backend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S9-B1 | 동시 사용자 100명 부하 테스트 (k6) + 병목 해소 | 8 | 32h | BE | k6 100 VU × 5분 기준 P95 ≤ 5초, 에러율 < 1%, 병목 지점 해소 완료 |
| S9-B2 | Redis 캐싱 — 임베딩 연산 결과 캐시 (TTL 1시간) | 5 | 20h | BE | 동일 쿼리 재요청 시 캐시 히트율 ≥ 80%, Redis 메모리 ≤ 512MB |
| S9-B3 | 전체 보안 감사 (SQL Injection, XSS, JWT 탈취, IDOR 시나리오) | 5 | 20h | BE | OWASP Top 10 체크리스트 통과, 취약점 발견 시 동 스프린트 내 수정 |

**Backend 소계**: **18 SP / 72시간**

---

### Frontend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S9-F1 | 사용자 만족도 설문 (NPS) 인앱 위젯 | 2 | 8h | FE | 로그인 후 14일마다 팝업 표시, 0~10 점수 선택 + 코멘트 입력, 결과 DB 저장 |

**Frontend 소계**: **2 SP / 8시간**

---

## 공수 요약

| 구분 | SP | 예상 공수 | 비율 |
|------|----|---------|------|
| Backend | 18 | 72h | 90% |
| Frontend | 2 | 8h | 10% |
| **합계** | **20** | **80h** | 100% |

### 일별 계획 (2인 기준)

| Day | Backend | Frontend |
|-----|---------|----------|
| Day 1 | S9-B2 Redis 도커 설정 + 연결 | S9-F1 NPS 위젯 UI |
| Day 2 | S9-B2 임베딩 캐시 키 설계 + 구현 | S9-F1 14일 표시 주기 로직 |
| Day 3 | S9-B2 캐시 히트율 테스트 | S9-F1 API 저장 연동 |
| Day 4 | S9-B1 k6 부하 테스트 스크립트 작성 | FE 코드 리뷰 |
| Day 5 | S9-B1 1차 부하 테스트 + 병목 분석 | — |
| Day 6 | S9-B1 병목 해소 (DB 쿼리 최적화, 커넥션 풀) | — |
| Day 7 | S9-B1 2차 부하 테스트 (100 VU 목표) | — |
| Day 8 | S9-B3 보안 감사 (SQL Injection, XSS, JWT) | 프론트엔드 XSS 검토 |
| Day 9 | S9-B3 IDOR + 취약점 수정 | 최종 E2E 테스트 전수 실행 |
| Day 10 | **R3 최종 스프린트 리뷰 + 프로젝트 회고** | **R3 최종 스프린트 리뷰 + 프로젝트 회고** |

---

## k6 부하 테스트 시나리오

`backend/tests/performance/load_test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 },   // 워밍업
    { duration: '3m', target: 100 },  // 목표 부하
    { duration: '1m', target: 0 },    // 쿨다운
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // P95 ≤ 5초
    http_req_failed:   ['rate<0.01'],  // 에러율 < 1%
  },
};

const BASE_URL = 'http://localhost:8000';

export default function () {
  // 1. 로그인
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'loadtest@example.com',
    password: 'LoadTest123!',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, { 'login 200': (r) => r.status === 200 });
  const token = loginRes.json('access_token');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // 2. 유사 결함 조회
  const similarRes = http.post(`${BASE_URL}/api/analysis/similar-defects`, JSON.stringify({
    change_description: '로그인 페이지 소셜 로그인 추가',
  }), { headers });

  check(similarRes, {
    'similar-defects 200': (r) => r.status === 200,
    'similar-defects ≤5s': (r) => r.timings.duration < 5000,
  });

  // 3. 영향도 분석
  const impactRes = http.post(`${BASE_URL}/api/analysis/impact`, JSON.stringify({
    change_description: '로그인 페이지 소셜 로그인 추가',
    affected_modules: ['Login', 'Auth'],
  }), { headers });

  check(impactRes, { 'impact 200': (r) => r.status === 200 });

  sleep(1);
}
```

---

## Redis 캐싱 전략

```
캐시 키 설계:
  similar_defects:{query_hash}  TTL: 1시간
  impact_analysis:{change_hash} TTL: 30분
  user_recommendations:{user_id} TTL: 6시간

캐시 무효화:
  - 새 결함 업로드 시 similar_defects 캐시 전체 무효화
  - TC 편집 시 해당 analysis 캐시 무효화
  - 사용자 활동 추가 시 recommendations 캐시 무효화

메모리 정책: allkeys-lru (메모리 한도 도달 시 LRU 제거)
```

---

## 보안 감사 체크리스트 (OWASP Top 10)

| # | 항목 | 테스트 방법 | 상태 |
|---|------|-----------|------|
| A01 | 접근 제어 취약점 (IDOR) | 타 사용자 분석 ID 직접 접근 시도 | ⬜ |
| A02 | 암호화 실패 | API 키 평문 저장 여부 확인 | ⬜ |
| A03 | SQL Injection | sqlmap 자동화 스캔 + 수동 테스트 | ⬜ |
| A04 | 안전하지 않은 설계 | JWT secret 길이/복잡도 확인 | ⬜ |
| A05 | 보안 설정 오류 | Docker 컨테이너 root 실행 여부 | ⬜ |
| A06 | 취약한 컴포넌트 | `pip-audit` + `npm audit` 실행 | ⬜ |
| A07 | 인증/세션 실패 | 토큰 재사용, 만료 후 접근 테스트 | ⬜ |
| A08 | 무결성 실패 | 파일 업로드 MIME 타입 검증 | ⬜ |
| A09 | 로깅/모니터링 실패 | 실패 로그 기록 여부 확인 | ⬜ |
| A10 | SSRF | 외부 URL 입력 필드 검증 | ⬜ |

추가 항목:
| 항목 | 테스트 | 상태 |
|------|--------|------|
| XSS | 코멘트/TC 입력 필드 `<script>` 주입 | ⬜ |
| CSRF | 상태 변경 요청 CSRF 토큰 검증 | ⬜ |
| Rate Limiting | 로그인 API 브루트포스 방지 | ⬜ |

---

## 완료 조건 (Definition of Done)

- [ ] k6 100 VU × 5분 P95 ≤ 5초, 에러율 < 1%
- [ ] Redis 캐시 히트율 ≥ 80% (동일 쿼리 기준)
- [ ] OWASP Top 10 체크리스트 전항목 통과
- [ ] `pip-audit` + `npm audit` — High 이상 취약점 0건
- [ ] NPS 위젯 14일 주기 표시 + 결과 저장
- [ ] R3 완료 기준 4항목 전체 통과

---

## R3 완료 기준 최종 체크

| 체크 항목 | 목표 | 상태 |
|---------|------|------|
| 동시 사용자 100명 P95 ≤ 5초 | 100 VU | ⬜ |
| Side effect 감소율 30% 달성 | 실측 데이터 필요 | ⬜ |
| 테스트케이스 활용률 70% 달성 | 사용자 데이터 기반 | ⬜ |
| 사용자 만족도 NPS ≥ 40 | NPS 위젯 수집 후 | ⬜ |

---

## 기술 부채 최종 해소 현황

| 부채 항목 | 발생 | 해소 스프린트 | 완료 |
|---------|------|------------|------|
| JSON 임베딩 → pgvector | R1 | S5 | ✅ |
| 전수 코사인 비교 → ANN | R1 | S5 | ✅ |
| 더미 데이터 → Redmine 연동 | R1 | S4 | ✅ |
| 템플릿 TC → 컨텍스트 기반 | R1 | S5 | ✅ |
| 단일 서버 → 수평 확장 (K8s) | R2 | S9 (부분) | ⬜ |

---

## 의존성

| 의존 항목 | 유형 | 비고 |
|---------|------|------|
| Redis 7.x | 인프라 | docker-compose에 추가 |
| k6 | 테스트 도구 | CI 환경에 설치 |
| pip-audit | 보안 도구 | `pip install pip-audit` |

---

## 리스크

| 리스크 | 확률 | 영향도 | 대응 방안 |
|--------|------|--------|---------|
| 100 VU P95 미달 | 중 | 고 | DB 커넥션 풀 증설, 쿼리 인덱스 추가, 비동기 처리 강화 |
| 보안 취약점 수정 공수 초과 | 중 | 중 | 심각도 High 이상만 동 스프린트, 나머지는 즉시 다음 이터레이션 |
| Redis OOM | 저 | 중 | maxmemory 512mb + allkeys-lru 정책 설정 |

---

## 프로젝트 완료 회고 아젠다

1. **Keep**: 잘 된 것 (각 팀원 3가지)
2. **Problem**: 아쉬운 것 (각 팀원 3가지)
3. **Try**: 다음에 시도할 것 (팀 합의 3가지)
4. **KPI 최종 측정**:
   - Side effect 감소율
   - TC 활용률
   - NPS 점수
   - 평균 분석 응답시간
5. **Phase 4 후보 아이디어 브레인스토밍**

---

*스프린트 작성일: 2026-03-13 | 상태: 🟡 계획됨*
