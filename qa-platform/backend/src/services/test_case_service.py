from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import logging
import random

from src.models.test_case import TestCase

logger = logging.getLogger(__name__)

TEST_CASE_TEMPLATES = {
    "Login": [
        {
            "title": "정상 로그인 검증 (Valid Login Verification)",
            "description": "유효한 자격 증명으로 로그인 시 정상 처리되는지 확인",
            "steps": [
                "로그인 페이지로 이동",
                "유효한 이메일 주소 입력",
                "올바른 비밀번호 입력",
                "로그인 버튼 클릭",
                "메인 대시보드 표시 확인",
            ],
            "expected_result": "사용자가 성공적으로 로그인되고 대시보드로 리다이렉트된다",
            "test_type": "Functional",
            "priority": "Critical",
            "tags": ["login", "authentication", "happy-path"],
        },
        {
            "title": "잘못된 비밀번호 처리 (Invalid Password Handling)",
            "description": "잘못된 비밀번호 입력 시 적절한 오류 메시지 표시 확인",
            "steps": [
                "로그인 페이지로 이동",
                "유효한 이메일 주소 입력",
                "잘못된 비밀번호 입력",
                "로그인 버튼 클릭",
                "오류 메시지 확인",
            ],
            "expected_result": "오류 메시지가 표시되고 로그인이 거부된다",
            "test_type": "Functional",
            "priority": "High",
            "tags": ["login", "authentication", "negative-test"],
        },
        {
            "title": "세션 타임아웃 처리 (Session Timeout Handling)",
            "description": "세션 만료 후 재인증 요구 확인",
            "steps": [
                "유효한 자격 증명으로 로그인",
                "세션 만료 시간 경과 대기",
                "보호된 페이지 접근 시도",
                "로그인 페이지로 리다이렉트 확인",
            ],
            "expected_result": "세션 만료 후 자동으로 로그인 페이지로 리다이렉트된다",
            "test_type": "Functional",
            "priority": "High",
            "tags": ["session", "timeout", "security"],
        },
    ],
    "Payment": [
        {
            "title": "결제 성공 시나리오 (Successful Payment Scenario)",
            "description": "유효한 카드로 결제 완료 확인",
            "steps": [
                "결제 페이지로 이동",
                "유효한 카드 정보 입력",
                "결제 금액 확인",
                "결제하기 버튼 클릭",
                "결제 성공 페이지 확인",
                "이메일 수신 확인",
            ],
            "expected_result": "결제가 성공적으로 처리되고 확인 이메일이 발송된다",
            "test_type": "Functional",
            "priority": "Critical",
            "tags": ["payment", "checkout", "happy-path"],
        },
        {
            "title": "결제 실패 처리 (Payment Failure Handling)",
            "description": "만료된 카드로 결제 시도 시 오류 처리 확인",
            "steps": [
                "결제 페이지로 이동",
                "만료된 카드 정보 입력",
                "결제하기 버튼 클릭",
                "오류 메시지 확인",
                "재시도 옵션 확인",
            ],
            "expected_result": "결제 실패 메시지가 표시되고 재시도 옵션이 제공된다",
            "test_type": "Functional",
            "priority": "High",
            "tags": ["payment", "error-handling", "negative-test"],
        },
    ],
    "Search": [
        {
            "title": "기본 검색 기능 (Basic Search Functionality)",
            "description": "키워드 검색 시 관련 결과 반환 확인",
            "steps": [
                "검색 페이지로 이동",
                "검색어 입력",
                "검색 버튼 클릭 또는 Enter 키 입력",
                "검색 결과 표시 확인",
                "결과 관련성 확인",
            ],
            "expected_result": "검색어와 관련된 결과가 정확히 반환된다",
            "test_type": "Functional",
            "priority": "High",
            "tags": ["search", "core-feature"],
        },
        {
            "title": "검색 결과 없음 처리 (No Search Results Handling)",
            "description": "검색 결과가 없을 때 적절한 메시지 표시 확인",
            "steps": [
                "검색 페이지로 이동",
                "존재하지 않는 검색어 입력",
                "검색 실행",
                "'결과 없음' 메시지 확인",
            ],
            "expected_result": "'결과 없음' 메시지가 표시된다",
            "test_type": "Functional",
            "priority": "Medium",
            "tags": ["search", "empty-state"],
        },
    ],
    "Cart": [
        {
            "title": "장바구니 추가 기능 (Add to Cart Functionality)",
            "description": "상품을 장바구니에 추가하는 기능 확인",
            "steps": [
                "상품 상세 페이지로 이동",
                "수량 선택",
                "장바구니 추가 버튼 클릭",
                "장바구니 아이콘 업데이트 확인",
                "장바구니 페이지에서 상품 확인",
            ],
            "expected_result": "상품이 장바구니에 정상적으로 추가된다",
            "test_type": "Functional",
            "priority": "Critical",
            "tags": ["cart", "add-to-cart"],
        },
    ],
    "Order": [
        {
            "title": "주문 완료 플로우 (Order Completion Flow)",
            "description": "주문 생성부터 확인까지 전체 플로우 검증",
            "steps": [
                "장바구니에 상품 추가",
                "결제 페이지로 이동",
                "배송 정보 입력",
                "결제 정보 입력",
                "주문 확인 버튼 클릭",
                "주문 확인 페이지 확인",
                "주문 확인 이메일 수신 확인",
            ],
            "expected_result": "주문이 성공적으로 생성되고 확인 이메일이 발송된다",
            "test_type": "E2E",
            "priority": "Critical",
            "tags": ["order", "checkout", "e2e"],
        },
    ],
    "default": [
        {
            "title": "기능 정상 동작 검증 (Functional Verification)",
            "description": "핵심 기능의 정상 동작 확인",
            "steps": [
                "테스트 환경 접속",
                "테스트 데이터 준비",
                "기능 실행",
                "결과 확인",
                "데이터 무결성 검증",
            ],
            "expected_result": "기능이 요구사항에 맞게 정상 동작한다",
            "test_type": "Functional",
            "priority": "Medium",
            "tags": ["functional", "core-feature"],
        },
        {
            "title": "회귀 테스트 (Regression Test)",
            "description": "변경 후 기존 기능의 정상 동작 유지 확인",
            "steps": [
                "변경된 모듈 접속",
                "주요 기능 목록 확인",
                "각 기능 순차 테스트",
                "이전 동작과 비교",
            ],
            "expected_result": "모든 기존 기능이 변경 전과 동일하게 동작한다",
            "test_type": "Regression",
            "priority": "High",
            "tags": ["regression", "smoke-test"],
        },
        {
            "title": "경계값 테스트 (Boundary Value Test)",
            "description": "입력값 경계 조건에서의 동작 확인",
            "steps": [
                "최소값 입력 테스트",
                "최대값 입력 테스트",
                "경계값 초과 입력 테스트",
                "공백/null 값 입력 테스트",
            ],
            "expected_result": "각 경계 조건에서 적절한 처리가 이루어진다",
            "test_type": "Functional",
            "priority": "Medium",
            "tags": ["boundary", "edge-case"],
        },
        {
            "title": "오류 처리 검증 (Error Handling Verification)",
            "description": "다양한 오류 상황에서의 적절한 메시지 및 복구 동작 확인",
            "steps": [
                "오류 발생 조건 설정",
                "오류 상황 재현",
                "오류 메시지 확인",
                "복구/재시도 옵션 확인",
            ],
            "expected_result": "명확한 오류 메시지가 표시되고 복구 방법이 안내된다",
            "test_type": "Functional",
            "priority": "High",
            "tags": ["error-handling", "ux"],
        },
        {
            "title": "성능 테스트 (Performance Test)",
            "description": "부하 상황에서의 응답 시간 및 안정성 확인",
            "steps": [
                "테스트 시나리오 준비",
                "동시 접속자 수 설정",
                "부하 테스트 실행",
                "응답 시간 측정",
                "오류율 확인",
            ],
            "expected_result": "정상 부하 조건에서 3초 이내 응답시간을 유지한다",
            "test_type": "Performance",
            "priority": "Medium",
            "tags": ["performance", "load-test"],
        },
    ],
}


class TestCaseService:
    """Service for generating test cases based on change descriptions and similar defects."""

    def __init__(self, db: Session):
        self.db = db

    async def generate_test_cases(
        self,
        query: str,
        module: Optional[str],
        similar_defects: List[Dict[str, Any]],
        num_cases: int = 5,
        user_id: Optional[int] = None,
        analysis_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Generate test cases based on the change description and similar defects."""
        test_cases = []
        source_defect_ids = [d.get("id") for d in similar_defects if d.get("id")]

        # Determine primary module
        primary_module = module
        if not primary_module and similar_defects:
            primary_module = similar_defects[0].get("module", "default")

        # Get templates for the module
        templates = TEST_CASE_TEMPLATES.get(primary_module, TEST_CASE_TEMPLATES["default"])

        # Generate test cases from templates
        selected_templates = templates[:num_cases]

        # If we need more, pad with default templates
        if len(selected_templates) < num_cases:
            default_templates = TEST_CASE_TEMPLATES["default"]
            additional = default_templates[:num_cases - len(selected_templates)]
            selected_templates.extend(additional)

        for i, template in enumerate(selected_templates[:num_cases]):
            # Enrich with context from similar defects
            enriched = self._enrich_test_case(template, query, similar_defects, primary_module, i)

            # Save to database
            try:
                tc = TestCase(
                    analysis_id=analysis_id,
                    user_id=user_id,
                    title=enriched["title"],
                    description=enriched["description"],
                    steps=enriched["steps"],
                    expected_result=enriched["expected_result"],
                    priority=enriched["priority"],
                    test_type=enriched["test_type"],
                    module=primary_module,
                    tags=enriched["tags"],
                    source_defect_ids=source_defect_ids,
                    is_ai_generated="true",
                )
                self.db.add(tc)
                self.db.flush()  # get ID without committing
                enriched["id"] = tc.id
            except Exception as e:
                logger.error(f"Error saving test case: {e}")
                self.db.rollback()
                enriched["id"] = None

            test_cases.append(enriched)

        try:
            self.db.commit()
        except Exception as e:
            logger.error(f"Error committing test cases: {e}")
            self.db.rollback()

        return test_cases

    def _enrich_test_case(
        self,
        template: Dict[str, Any],
        query: str,
        similar_defects: List[Dict[str, Any]],
        module: Optional[str],
        index: int,
    ) -> Dict[str, Any]:
        """Enrich a test case template with context from the query and similar defects."""
        enriched = {
            "title": template["title"],
            "description": template["description"],
            "steps": list(template["steps"]),
            "expected_result": template["expected_result"],
            "priority": template.get("priority", "Medium"),
            "test_type": template.get("test_type", "Functional"),
            "module": module,
            "tags": list(template.get("tags", [])),
            "id": None,
        }

        # Add context from similar defects to description
        if similar_defects and index < len(similar_defects):
            defect = similar_defects[index]
            similarity_score = defect.get("similarity_score", 0)
            defect_title = defect.get("title", "")
            if similarity_score > 0.5 and defect_title:
                enriched["description"] += (
                    f"\n\n[AI Reference] Similar to defect: '{defect_title}' "
                    f"(similarity: {similarity_score:.1%})"
                )

        # Add module tag if not present
        if module and module.lower() not in [t.lower() for t in enriched["tags"]]:
            enriched["tags"].append(module.lower().replace(" ", "-"))

        # Add query-derived context step if it's a regression or functional test
        if enriched["test_type"] in ["Functional", "Regression"] and query:
            context_step = f"변경 사항 확인: {query[:80]}{'...' if len(query) > 80 else ''}"
            if context_step not in enriched["steps"]:
                enriched["steps"].insert(1, context_step)

        return enriched
