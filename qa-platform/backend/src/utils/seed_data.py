"""
Seed data: 20 realistic defects covering various modules in Korean/English.
"""

SEED_DEFECTS = [
    {
        "title": "로그인 실패 - 올바른 비밀번호 입력 시 인증 오류",
        "description": (
            "사용자가 올바른 이메일과 비밀번호를 입력해도 '인증 오류'가 발생합니다. "
            "특수문자가 포함된 비밀번호에서 주로 발생하며, 특수문자 없는 비밀번호는 정상 동작합니다. "
            "When users enter correct email and password with special characters, authentication fails with error code AUTH_001."
        ),
        "severity": "Critical",
        "module": "Login",
        "status": "Open",
        "reporter": "QA Team",
        "related_features": ["authentication", "session", "password-validation"],
    },
    {
        "title": "결제 처리 중 타임아웃 오류 발생",
        "description": (
            "신용카드 결제 시 30초 후 타임아웃 오류가 발생합니다. "
            "특히 네트워크 지연 상황에서 결제 트랜잭션이 중단되고 중복 결제가 발생하는 경우가 있습니다. "
            "Payment processing timeout occurs after 30 seconds causing duplicate transaction issues."
        ),
        "severity": "Critical",
        "module": "Payment",
        "status": "In Progress",
        "reporter": "Customer Support",
        "related_features": ["payment-gateway", "transaction", "credit-card", "refund"],
    },
    {
        "title": "검색 결과 필터링 후 페이지 이동 시 필터 초기화",
        "description": (
            "사용자가 검색 결과에서 카테고리 필터를 적용한 후 다음 페이지로 이동하면 필터 설정이 초기화됩니다. "
            "URL에 필터 파라미터가 유지되지 않는 것이 원인으로 추정됩니다. "
            "Filter parameters are not persisted in URL when navigating to the next page of search results."
        ),
        "severity": "High",
        "module": "Search",
        "status": "Open",
        "reporter": "QA Engineer",
        "related_features": ["search", "pagination", "filter", "url-params"],
    },
    {
        "title": "장바구니 수량 변경 시 총액 미업데이트",
        "description": (
            "장바구니에서 상품 수량을 변경해도 총 결제 금액이 자동으로 갱신되지 않습니다. "
            "페이지를 새로고침해야만 올바른 금액이 표시됩니다. "
            "Total amount in cart does not update in real-time when quantity is changed; requires page refresh."
        ),
        "severity": "High",
        "module": "Cart",
        "status": "Open",
        "reporter": "Beta Tester",
        "related_features": ["cart", "pricing", "real-time-update", "checkout"],
    },
    {
        "title": "주문 상태 이메일 알림 미발송",
        "description": (
            "주문이 '배송 준비 중' 상태로 변경될 때 사용자에게 이메일 알림이 발송되지 않습니다. "
            "다른 상태 변경(주문 완료, 배송 중)은 정상 발송됩니다. "
            "Email notifications are not sent when order status changes to 'Preparing for Shipment'."
        ),
        "severity": "Medium",
        "module": "Order",
        "status": "Open",
        "reporter": "QA Team",
        "related_features": ["notification", "email", "order-status", "shipping"],
    },
    {
        "title": "사용자 프로필 이미지 업로드 실패 - 5MB 이상 파일",
        "description": (
            "프로필 이미지 업로드 시 5MB 이상의 파일에 대해 업로드가 실패합니다. "
            "오류 메시지 없이 로딩만 지속되다 타임아웃이 발생합니다. "
            "Profile image upload silently fails for files larger than 5MB with timeout error."
        ),
        "severity": "Medium",
        "module": "User Profile",
        "status": "Resolved",
        "reporter": "QA Engineer",
        "related_features": ["file-upload", "profile", "image", "validation"],
    },
    {
        "title": "푸시 알림 수신 설정 저장 실패",
        "description": (
            "알림 설정 페이지에서 푸시 알림을 비활성화해도 앱 재시작 후 설정이 원래대로 돌아옵니다. "
            "설정이 로컬에만 저장되고 서버에 동기화되지 않는 것으로 보입니다. "
            "Push notification settings are not persisted to server; settings revert after app restart."
        ),
        "severity": "Medium",
        "module": "Notification",
        "status": "In Progress",
        "reporter": "Mobile QA",
        "related_features": ["push-notification", "settings", "persistence", "mobile"],
    },
    {
        "title": "월별 매출 리포트 데이터 불일치",
        "description": (
            "대시보드의 월별 매출 리포트와 상세 주문 목록의 합계 금액이 불일치합니다. "
            "환불된 주문이 매출에서 차감되지 않는 것이 원인으로 파악되었습니다. "
            "Monthly sales report shows incorrect totals because refunded orders are not deducted."
        ),
        "severity": "High",
        "module": "Report",
        "status": "Open",
        "reporter": "Finance Team",
        "related_features": ["report", "sales", "refund", "data-accuracy"],
    },
    {
        "title": "대시보드 로딩 시간 과도 - 10초 이상",
        "description": (
            "메인 대시보드 페이지 로딩 시 10초 이상 소요되는 성능 문제가 발생합니다. "
            "많은 양의 데이터를 한 번에 요청하는 API 호출 구조가 원인으로 분석됩니다. "
            "Dashboard page takes over 10 seconds to load due to unoptimized bulk data API calls."
        ),
        "severity": "High",
        "module": "Dashboard",
        "status": "In Progress",
        "reporter": "Performance QA",
        "related_features": ["performance", "loading", "api", "optimization"],
    },
    {
        "title": "API 게이트웨이 레이트 리미팅 오작동",
        "description": (
            "API 게이트웨이의 레이트 리미팅이 정상적인 사용자 요청에도 429 오류를 반환합니다. "
            "분당 60회 제한 정책임에도 10회 이후 차단이 발생합니다. "
            "API rate limiting incorrectly blocks legitimate requests after 10 calls instead of 60."
        ),
        "severity": "Critical",
        "module": "API Gateway",
        "status": "Open",
        "reporter": "Backend Engineer",
        "related_features": ["rate-limiting", "api", "gateway", "authentication"],
    },
    {
        "title": "소셜 로그인(Google) 연동 실패",
        "description": (
            "Google OAuth를 통한 소셜 로그인 시 콜백 URL 처리 오류로 인해 로그인이 실패합니다. "
            "redirect_uri_mismatch 오류가 발생하며 프로덕션 환경에서만 재현됩니다. "
            "Google OAuth social login fails with redirect_uri_mismatch error in production environment only."
        ),
        "severity": "High",
        "module": "Login",
        "status": "Open",
        "reporter": "DevOps Team",
        "related_features": ["oauth", "social-login", "google", "authentication"],
    },
    {
        "title": "모바일 결제 UI 버튼 터치 영역 부족",
        "description": (
            "모바일 기기에서 결제 확인 버튼의 터치 영역이 너무 작아 사용자가 클릭하기 어렵습니다. "
            "특히 화면 크기가 작은 기기(iPhone SE 등)에서 버튼 중앙을 정확히 터치해야만 반응합니다. "
            "Payment confirmation button has insufficient touch target size on mobile devices."
        ),
        "severity": "Medium",
        "module": "Payment",
        "status": "Open",
        "reporter": "UX Team",
        "related_features": ["mobile", "ux", "accessibility", "button"],
    },
    {
        "title": "자동완성 검색어 제안 응답 속도 저하",
        "description": (
            "검색창 자동완성 기능이 타이핑 후 2초 이상 지연되어 표시됩니다. "
            "대량의 검색어 데이터베이스에서 인덱스 없이 전체 스캔을 하는 것이 원인입니다. "
            "Search autocomplete suggestions are delayed over 2 seconds due to full table scan without index."
        ),
        "severity": "Medium",
        "module": "Search",
        "status": "Resolved",
        "reporter": "QA Engineer",
        "related_features": ["autocomplete", "search", "performance", "database"],
    },
    {
        "title": "쿠폰 중복 적용 가능 취약점",
        "description": (
            "장바구니에서 동일한 쿠폰 코드를 여러 번 적용할 수 있는 취약점이 발견되었습니다. "
            "서버 측 쿠폰 적용 횟수 검증 로직이 없어 최대 100% 할인도 가능합니다. "
            "Security vulnerability allows applying the same coupon multiple times due to missing server-side validation."
        ),
        "severity": "Critical",
        "module": "Cart",
        "status": "In Progress",
        "reporter": "Security Team",
        "related_features": ["coupon", "security", "validation", "discount"],
    },
    {
        "title": "주문 취소 후 재고 복구 미처리",
        "description": (
            "주문 취소 시 해당 상품의 재고가 복구되지 않는 문제가 있습니다. "
            "취소 이벤트 핸들러에서 재고 업데이트 서비스 호출이 누락된 것으로 확인됩니다. "
            "Inventory is not restored when an order is cancelled due to missing service call in cancel event handler."
        ),
        "severity": "High",
        "module": "Order",
        "status": "Open",
        "reporter": "Operations Team",
        "related_features": ["inventory", "order-cancel", "stock-management"],
    },
    {
        "title": "개인정보 수정 후 세션 무효화 미처리",
        "description": (
            "사용자가 비밀번호 변경 후 기존 세션이 무효화되지 않습니다. "
            "비밀번호 변경 이후에도 이전 토큰으로 API 접근이 가능한 보안 취약점입니다. "
            "Security issue: existing sessions remain valid after password change, allowing unauthorized API access."
        ),
        "severity": "High",
        "module": "User Profile",
        "status": "Open",
        "reporter": "Security Team",
        "related_features": ["security", "session", "password-change", "token-invalidation"],
    },
    {
        "title": "이메일 알림 한글 깨짐 현상",
        "description": (
            "주문 확인 이메일에서 한글이 깨져서 표시되는 문제가 발생합니다. "
            "이메일 전송 시 charset 설정이 UTF-8로 되어 있지 않아 한글이 정상 표시되지 않습니다. "
            "Korean characters appear corrupted in order confirmation emails due to incorrect charset configuration."
        ),
        "severity": "Medium",
        "module": "Notification",
        "status": "Resolved",
        "reporter": "Customer Support",
        "related_features": ["email", "encoding", "korean", "internationalization"],
    },
    {
        "title": "주간 리포트 엑셀 다운로드 인코딩 오류",
        "description": (
            "주간 리포트를 엑셀 파일로 다운로드 시 한글 데이터가 깨져서 표시됩니다. "
            "UTF-8 BOM 설정 없이 엑셀 파일이 생성되어 발생하는 문제입니다. "
            "Korean characters in Excel report downloads are corrupted due to missing UTF-8 BOM configuration."
        ),
        "severity": "Medium",
        "module": "Report",
        "status": "Open",
        "reporter": "QA Team",
        "related_features": ["excel", "export", "encoding", "korean", "report"],
    },
    {
        "title": "대시보드 실시간 데이터 갱신 WebSocket 연결 끊김",
        "description": (
            "대시보드의 실시간 통계 갱신을 위한 WebSocket 연결이 30분마다 끊어집니다. "
            "재연결 로직이 구현되어 있지 않아 페이지 새로고침 없이는 실시간 데이터를 받지 못합니다. "
            "WebSocket connection for real-time dashboard updates disconnects every 30 minutes without auto-reconnect."
        ),
        "severity": "Medium",
        "module": "Dashboard",
        "status": "In Progress",
        "reporter": "Frontend Team",
        "related_features": ["websocket", "real-time", "dashboard", "auto-reconnect"],
    },
    {
        "title": "API 게이트웨이 JWT 토큰 만료 오류 응답 불일치",
        "description": (
            "만료된 JWT 토큰으로 API 요청 시 일관되지 않은 오류 응답이 반환됩니다. "
            "일부 엔드포인트는 401을 반환하고 일부는 500을 반환하는 불일치 문제가 있습니다. "
            "Inconsistent error responses for expired JWT tokens: some endpoints return 401, others return 500."
        ),
        "severity": "High",
        "module": "API Gateway",
        "status": "Open",
        "reporter": "Backend QA",
        "related_features": ["jwt", "authentication", "error-handling", "api-consistency"],
    },
]
