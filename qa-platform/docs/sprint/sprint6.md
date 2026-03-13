# Sprint 6 — 알림 시스템 + 테스트케이스 편집 저장

> **릴리즈**: R2 — Enhanced | **기간**: Week 11–12 (2주)
> **스프린트 목표**: 분석 완료 시 인앱/이메일 알림을 제공하고, 사용자가 TC를 편집하여 DB에 저장할 수 있다.

---

## 스프린트 개요

| 항목 | 내용 |
|------|------|
| 기간 | Week 11 ~ Week 12 (10 영업일) |
| 팀 구성 | Backend 1명 + Frontend 1명 |
| 총 스토리 포인트 | **13 SP** |
| 예상 총 공수 | **52시간** (1 SP = 4시간 기준) |
| Velocity 목표 | 13 SP |
| 선행 스프린트 | Sprint 5 완료 필수 |

> **SP가 낮은 이유**: R2 마지막 스프린트로, 품질 검증 + R2 완료 기준 점검에 여유 시간 배분.

---

## 스프린트 목표 (Sprint Goal)

> "QA 팀원이 영향도 분석 완료 시 인앱 알림을 즉시 받고,
> High 이상 심각도 영향도 결과는 이메일로도 수신할 수 있다.
> 또한 제안된 테스트케이스를 수정하여 DB에 저장할 수 있다."

---

## 태스크 목록

### Backend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S6-B1 | 인앱 알림 시스템 — 분석 완료 시 SSE(Server-Sent Events) 푸시 | 5 | 20h | BE | 분석 완료 후 3초 이내 클라이언트 수신, 읽음 상태 DB 저장 |
| S6-B2 | 이메일 알림 — impact_score ≥ 0.7 시 SMTP 발송 | 3 | 12h | BE | 이메일 발송 성공 로그, HTML 템플릿 적용, 중복 발송 방지 |
| S6-B3 | `PATCH /api/test-cases/{id}` — 사용자 편집 내용 저장 | 2 | 8h | BE | 부분 업데이트 (title/steps/expected_result), 수정 이력 타임스탬프 |

**Backend 소계**: **10 SP / 40시간**

---

### Frontend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S6-F1 | 알림 드롭다운 UI — 읽음/안읽음 뱃지, 클릭 시 결과 페이지 이동 | 3 | 12h | FE | 미읽음 건수 헤더 뱃지 표시, 클릭 시 /analysis/{id}로 이동 |

**Frontend 소계**: **3 SP / 12시간**

---

## 공수 요약

| 구분 | SP | 예상 공수 | 비율 |
|------|----|---------|------|
| Backend | 10 | 40h | 77% |
| Frontend | 3 | 12h | 23% |
| **합계** | **13** | **52h** | 100% |

### 일별 계획 (2인 기준)

| Day | Backend | Frontend |
|-----|---------|----------|
| Day 1 | S6-B1 SSE 엔드포인트 설계 + 구현 | S6-F1 알림 드롭다운 UI 설계 |
| Day 2 | S6-B1 SSE 클라이언트 연결 관리 | S6-F1 SSE 연결 + 알림 수신 |
| Day 3 | S6-B1 알림 DB 저장 + 읽음 처리 API | S6-F1 읽음/안읽음 토글 |
| Day 4 | S6-B2 SMTP 설정 + 이메일 템플릿 | S6-F1 클릭 시 결과 페이지 이동 |
| Day 5 | S6-B2 이메일 발송 조건 + 중복 방지 | FE 알림 통합 테스트 |
| Day 6 | S6-B3 PATCH /test-cases/{id} 구현 | TC 편집 저장 FE 연동 |
| Day 7 | 통합 테스트 | 통합 테스트 |
| Day 8 | R2 완료 기준 검증 | R2 완료 기준 검증 |
| Day 9 | 버그 수정 + 코드 정리 | 버그 수정 + 코드 정리 |
| Day 10 | **R2 스프린트 리뷰 + 회고** | **R2 스프린트 리뷰 + 회고** |

---

## SSE 알림 아키텍처

```
[분석 완료 이벤트 발생]
         │
         ▼
[FastAPI Background Task]
         │
         ├─ notifications 테이블에 INSERT
         │
         ▼
[GET /api/notifications/stream (SSE)]
    │
    └─ 클라이언트 EventSource 연결
        └─ event: new_notification
           data: { id, type, message, analysis_id, created_at }

읽음 처리:
  PATCH /api/notifications/{id}/read
  → is_read = true
```

---

## 이메일 알림 조건

| 조건 | 발송 여부 |
|------|---------|
| impact_score ≥ 0.7 + severity Critical/High | ✅ 즉시 발송 |
| impact_score 0.5~0.7 | ❌ 인앱 알림만 |
| impact_score < 0.5 | ❌ 없음 |

---

## 완료 조건 (Definition of Done)

- [ ] 분석 완료 3초 이내 인앱 알림 수신
- [ ] impact_score ≥ 0.7 이메일 발송 (HTML 템플릿)
- [ ] 중복 알림 발송 방지 (멱등성 키)
- [ ] TC PATCH API — 부분 업데이트 + 타임스탬프
- [ ] 알림 드롭다운 미읽음 뱃지 + 읽음 처리
- [ ] R2 완료 기준 4항목 전체 통과

---

## R2 완료 기준 최종 체크

| 체크 항목 | 담당 스프린트 | 상태 |
|---------|------------|------|
| Redmine 연동 동기화 ≤ 5분 지연 | S4 | ⬜ |
| pgvector ANN 응답 ≤ 2초 (1000건) | S5 | ⬜ |
| 대시보드 Side effect 감소율 지표 | S5 | ⬜ |
| TC 활용률 측정 시작 | S6 | ⬜ |

---

## 의존성

| 의존 항목 | 유형 | 비고 |
|---------|------|------|
| SMTP 서버 설정 | 환경 | `.env`에 SMTP_HOST, SMTP_PORT, SMTP_USER 설정 필요 |
| FastAPI SSE 지원 | 내장 | `StreamingResponse` + `EventSourceResponse` |

---

## 리스크

| 리스크 | 확률 | 영향도 | 대응 방안 |
|--------|------|--------|---------|
| SSE 연결 끊김 (모바일/프록시) | 중 | 중 | 클라이언트 자동 재연결 로직 (EventSource reconnect) |
| SMTP 설정 미비로 이메일 미발송 | 중 | 저 | 이메일 비활성화 시 인앱 알림으로 대체 (설정 선택적) |
| TC 동시 편집 충돌 | 저 | 중 | optimistic locking (updated_at 비교) |

---

*스프린트 작성일: 2026-03-13 | 상태: 🟡 계획됨*
