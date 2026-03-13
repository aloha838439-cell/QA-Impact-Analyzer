# Sprint 4 — 외부 연동 + 데이터 동기화

> **릴리즈**: R2 — Enhanced | **기간**: Week 7–8 (2주)
> **스프린트 목표**: Redmine API와 연동하여 결함 데이터를 자동으로 동기화한다.

---

## 스프린트 개요

| 항목 | 내용 |
|------|------|
| 기간 | Week 7 ~ Week 8 (10 영업일) |
| 팀 구성 | Backend 1명 + Frontend 1명 |
| 총 스토리 포인트 | **18 SP** |
| 예상 총 공수 | **72시간** (1 SP = 4시간 기준) |
| Velocity 목표 | 18 SP |
| 선행 스프린트 | Sprint 1~3 (R1 MVP) 완료 필수 |

---

## 스프린트 목표 (Sprint Goal)

> "QA 리더가 Redmine API 키를 설정 화면에 입력하면,
> 5분 간격으로 결함 데이터가 자동 동기화되고,
> 동기화 상태와 마지막 실행 시각이 화면에 표시된다.
> 동기화 실패 시 자동 재시도 로직이 동작한다."

---

## 태스크 목록

### Backend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S4-B1 | Redmine API 연동 — 결함 자동 동기화 (Webhook + Polling 병행) | 8 | 32h | BE | Redmine GET /issues 호출 성공, 신규/수정 결함 자동 upsert, ≤ 5분 지연 |
| S4-B2 | 연동 설정 저장 API (`POST/GET /api/integrations/redmine`) | 2 | 8h | BE | API 키 암호화 저장(AES-256), 연결 테스트 엔드포인트 동작 |
| S4-B3 | 동기화 실패 시 재시도 큐 (FastAPI BackgroundTasks + 지수 백오프) | 5 | 20h | BE | 3회 재시도 후 dead-letter 큐 이동, 실패 로그 DB 저장 |

**Backend 소계**: **15 SP / 60시간**

---

### Frontend

| ID | 태스크 | SP | 예상 공수 | 담당 | 완료 조건 |
|----|--------|----|---------|----|----------|
| S4-F1 | 연동 설정 페이지 UI — API 키 입력, 동기화 주기 설정, 연결 테스트 버튼 | 2 | 8h | FE | 연결 성공 → 초록 배너, 실패 → 에러 메시지 + 재시도 버튼 |
| S4-F2 | 연동 상태 배너 — 마지막 동기화 시각 + 상태 아이콘 표시 | 1 | 4h | FE | "동기화됨 5분 전" 형식, 30초 폴링 갱신 |

**Frontend 소계**: **3 SP / 12시간**

---

## 공수 요약

| 구분 | SP | 예상 공수 | 비율 |
|------|----|---------|------|
| Backend | 15 | 60h | 83% |
| Frontend | 3 | 12h | 17% |
| **합계** | **18** | **72h** | 100% |

> **BE 비중이 높은 이유**: Redmine API 연동, 재시도 큐 설계가 핵심 작업이며 FE는 설정 UI만 담당.

### 일별 계획 (2인 기준)

| Day | Backend | Frontend |
|-----|---------|----------|
| Day 1 | S4-B1 Redmine API 문서 분석 + 클라이언트 설계 | S4-F1 연동 설정 페이지 UI 설계 |
| Day 2 | S4-B1 Redmine API 클라이언트 구현 | S4-F1 API 키 입력 + 암호화 처리 |
| Day 3 | S4-B1 결함 동기화 로직 (upsert) | S4-F1 연결 테스트 버튼 + 결과 표시 |
| Day 4 | S4-B1 Polling 스케줄러 (5분 간격) | S4-F2 연동 상태 배너 |
| Day 5 | S4-B2 연동 설정 저장 API | S4-F2 30초 폴링 갱신 |
| Day 6 | S4-B3 재시도 큐 설계 | FE 버그 수정 + 코드 리뷰 |
| Day 7 | S4-B3 지수 백오프 구현 | 통합 테스트 지원 |
| Day 8 | S4-B3 실패 로그 저장 + 알림 | — |
| Day 9 | 통합 테스트 (Redmine 샌드박스) | 통합 테스트 + 버그 수정 |
| Day 10 | **스프린트 리뷰 + 회고** | **스프린트 리뷰 + 회고** |

---

## Redmine 연동 아키텍처

```
[FastAPI BackgroundTask / APScheduler]
    │
    ├─ Polling (5분 간격)
    │   └─ GET https://{redmine_url}/issues.json?updated_on=>{last_sync}
    │       └─ Defect upsert → PostgreSQL → embedding 재계산
    │
    └─ Webhook (선택적)
        └─ POST /api/integrations/redmine/webhook
            └─ 이슈 생성/수정 이벤트 실시간 처리

재시도 전략:
  1차: 즉시 재시도
  2차: 1분 후
  3차: 5분 후
  이후: dead-letter (sync_errors 테이블)
```

---

## 완료 조건 (Definition of Done)

- [ ] Redmine 연동 후 결함 자동 동기화 ≤ 5분 지연
- [ ] API 키 AES-256 암호화 저장
- [ ] 동기화 실패 시 3회 재시도 + 실패 로그 저장
- [ ] 연동 상태 배너 마지막 동기화 시각 표시
- [ ] 연결 테스트 버튼 동작 (성공/실패 피드백)
- [ ] Redmine 없는 환경에서는 기존 CSV 업로드 정상 동작 유지

---

## 의존성

| 의존 항목 | 유형 | 비고 |
|---------|------|------|
| Redmine 인스턴스 (테스트용) | 외부 | 개발팀 Redmine 샌드박스 필요 |
| APScheduler 또는 Celery | 패키지 | 경량 스케줄링은 APScheduler 권장 |
| cryptography (AES-256) | 패키지 | API 키 암호화 |

---

## 리스크

| 리스크 | 확률 | 영향도 | 대응 방안 |
|--------|------|--------|---------|
| Redmine API Rate Limit | 중 | 중 | 요청 간격 조절 + 지수 백오프 |
| Redmine 버전별 API 차이 | 중 | 중 | Redmine 4.x, 5.x 모두 테스트 |
| 테스트 환경 Redmine 미확보 | 고 | 중 | Mock 서버(WireMock) 대체 가능 |

---

*스프린트 작성일: 2026-03-13 | 상태: 🟡 계획됨*
