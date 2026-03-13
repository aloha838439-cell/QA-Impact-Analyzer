from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import logging
from datetime import datetime

from src.models.impact_analysis import ImpactAnalysis
from src.models.defect import Defect

logger = logging.getLogger(__name__)

SEVERITY_WEIGHTS = {
    "Critical": 1.0,
    "High": 0.75,
    "Medium": 0.5,
    "Low": 0.25,
}

RISK_THRESHOLDS = {
    "Critical": 75,
    "High": 50,
    "Medium": 25,
    "Low": 0,
}

SIDE_EFFECT_TEMPLATES = {
    "Login": [
        "사용자 인증 흐름이 영향을 받을 수 있습니다 (User authentication flow may be affected)",
        "세션 관리 로직 검토 필요 (Session management logic needs review)",
        "SSO/OAuth 연동 테스트 필요 (SSO/OAuth integration testing required)",
        "비밀번호 재설정 플로우 검증 필요 (Password reset flow validation needed)",
    ],
    "Payment": [
        "결제 트랜잭션 무결성 검증 필요 (Payment transaction integrity verification needed)",
        "환불 및 취소 프로세스 영향 가능성 (Refund and cancellation process may be affected)",
        "PCI DSS 컴플라이언스 재검토 필요 (PCI DSS compliance review required)",
        "결제 게이트웨이 연동 테스트 필요 (Payment gateway integration testing required)",
    ],
    "Search": [
        "검색 결과 정확도에 영향 가능 (Search result accuracy may be affected)",
        "검색 인덱스 무결성 검증 필요 (Search index integrity verification needed)",
        "자동완성 기능 테스트 필요 (Autocomplete feature testing needed)",
        "필터 및 정렬 기능 검증 필요 (Filter and sort functionality validation needed)",
    ],
    "Cart": [
        "장바구니 상태 동기화 문제 가능성 (Cart state synchronization issues possible)",
        "재고 확인 로직 검증 필요 (Inventory check logic validation needed)",
        "쿠폰 및 할인 적용 테스트 필요 (Coupon and discount application testing needed)",
        "게스트 장바구니 처리 검토 필요 (Guest cart handling review needed)",
    ],
    "Order": [
        "주문 상태 전이 검증 필요 (Order state transition validation needed)",
        "알림 발송 로직 영향 가능성 (Notification dispatch logic may be affected)",
        "재고 차감 트랜잭션 검토 필요 (Inventory deduction transaction review needed)",
        "배송 연동 API 테스트 필요 (Shipping integration API testing needed)",
    ],
    "User Profile": [
        "사용자 데이터 마이그레이션 검토 필요 (User data migration review needed)",
        "개인정보 처리 방침 준수 확인 필요 (Privacy policy compliance verification needed)",
        "계정 삭제 플로우 검증 필요 (Account deletion flow validation needed)",
    ],
    "Notification": [
        "이메일/SMS 발송 로직 테스트 필요 (Email/SMS dispatch logic testing needed)",
        "알림 설정 상속 로직 검증 필요 (Notification preference inheritance logic validation needed)",
        "실시간 알림 WebSocket 연결 검토 필요 (Real-time notification WebSocket connection review needed)",
    ],
    "Report": [
        "데이터 집계 정확도 검증 필요 (Data aggregation accuracy verification needed)",
        "대용량 데이터 처리 성능 테스트 필요 (Large data processing performance testing needed)",
        "내보내기 파일 형식 호환성 검토 필요 (Export file format compatibility review needed)",
    ],
    "Dashboard": [
        "대시보드 지표 계산 로직 검증 필요 (Dashboard metric calculation logic validation needed)",
        "실시간 데이터 갱신 기능 테스트 필요 (Real-time data refresh feature testing needed)",
        "권한별 데이터 가시성 검토 필요 (Role-based data visibility review needed)",
    ],
    "API Gateway": [
        "API 레이트 리미팅 정책 검토 필요 (API rate limiting policy review needed)",
        "인증 미들웨어 동작 검증 필요 (Authentication middleware behavior validation needed)",
        "API 버전 호환성 테스트 필요 (API version compatibility testing needed)",
        "로드 밸런싱 설정 검토 필요 (Load balancing configuration review needed)",
    ],
    "default": [
        "관련 모듈 회귀 테스트 필요 (Related module regression testing needed)",
        "통합 테스트 재실행 권장 (Integration test re-run recommended)",
        "성능 테스트 수행 권장 (Performance testing recommended)",
        "경계값 테스트 필요 (Boundary value testing needed)",
    ],
}


class ImpactService:
    """Service for analyzing the impact of software changes."""

    def __init__(self, db: Session):
        self.db = db

    async def analyze_impact(
        self,
        query: str,
        module: Optional[str],
        similar_defects: List[Dict[str, Any]],
        user_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Analyze the impact of a change based on similar historical defects.

        Returns a dict with impact_score, risk_level, affected_areas,
        potential_side_effects, severity_distribution, and recommendation.
        """
        if not similar_defects:
            return self._empty_result()

        # 1. Calculate similarity-based score (top-3 similar defects)
        top_3 = similar_defects[:3]
        similarity_scores = [d.get("similarity_score", 0) for d in top_3]
        max_similarity = max(similarity_scores) if similarity_scores else 0
        avg_top3_similarity = sum(similarity_scores) / len(similarity_scores) if similarity_scores else 0

        # 2. Severity distribution analysis
        severity_dist = self._compute_severity_distribution(similar_defects)
        severity_score = self._compute_severity_score(severity_dist)

        # 3. Module overlap analysis
        affected_modules = self._extract_affected_modules(similar_defects)
        module_score = min(len(affected_modules) / 5.0, 1.0)  # normalize to max 5 modules

        # 4. Compute weighted impact score (0-100)
        impact_score = (
            avg_top3_similarity * 0.45 +  # Similarity weight: 45%
            severity_score * 0.35 +         # Severity weight: 35%
            module_score * 0.20             # Module breadth weight: 20%
        ) * 100

        impact_score = min(round(impact_score, 1), 100.0)

        # 5. Determine risk level
        risk_level = self._determine_risk_level(impact_score)

        # 6. Collect affected areas
        affected_areas = self._extract_affected_areas(similar_defects, module)

        # 7. Generate potential side effects
        side_effects = self._generate_side_effects(similar_defects, module, severity_dist)

        # 8. Generate recommendation
        recommendation = self._generate_recommendation(risk_level, affected_areas, severity_dist)

        # 9. Save analysis to DB
        try:
            analysis = ImpactAnalysis(
                user_id=user_id,
                query_description=query,
                query_module=module,
                impact_score=impact_score,
                risk_level=risk_level,
                affected_areas=affected_areas,
                potential_side_effects=side_effects,
                similar_defect_ids=[d.get("id") for d in similar_defects if d.get("id")],
                similarity_scores=[d.get("similarity_score", 0) for d in similar_defects],
            )
            self.db.add(analysis)
            self.db.commit()
        except Exception as e:
            logger.error(f"Error saving impact analysis: {e}")
            self.db.rollback()

        return {
            "impact_score": impact_score,
            "risk_level": risk_level,
            "affected_areas": affected_areas,
            "potential_side_effects": side_effects,
            "severity_distribution": severity_dist,
            "recommendation": recommendation,
        }

    def _compute_severity_distribution(self, defects: List[Dict]) -> Dict[str, int]:
        """Count defects by severity level."""
        dist = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
        for d in defects:
            severity = d.get("severity", "Medium")
            if severity in dist:
                dist[severity] += 1
            else:
                dist["Medium"] += 1
        return dist

    def _compute_severity_score(self, severity_dist: Dict[str, int]) -> float:
        """Compute a 0-1 score based on severity distribution."""
        total = sum(severity_dist.values())
        if total == 0:
            return 0.0

        weighted_sum = sum(
            SEVERITY_WEIGHTS.get(severity, 0.5) * count
            for severity, count in severity_dist.items()
        )
        return weighted_sum / total

    def _extract_affected_modules(self, defects: List[Dict]) -> List[str]:
        """Extract unique module names from defects."""
        modules = set()
        for d in defects:
            if d.get("module"):
                modules.add(d["module"])
        return list(modules)

    def _extract_affected_areas(
        self, defects: List[Dict], primary_module: Optional[str]
    ) -> List[str]:
        """Collect unique affected areas from related features and modules."""
        areas = set()

        if primary_module:
            areas.add(primary_module)

        for d in defects:
            if d.get("module"):
                areas.add(d["module"])
            related = d.get("related_features", [])
            if isinstance(related, list):
                for feature in related:
                    if feature:
                        areas.add(str(feature))

        return sorted(list(areas))[:10]  # limit to top 10

    def _generate_side_effects(
        self,
        defects: List[Dict],
        module: Optional[str],
        severity_dist: Dict[str, int],
    ) -> List[str]:
        """Generate potential side effect warnings based on module and severity patterns."""
        side_effects = set()

        # Add module-specific side effects
        modules_to_check = [module] if module else []
        for d in defects[:5]:
            if d.get("module"):
                modules_to_check.append(d["module"])

        for mod in modules_to_check:
            if mod:
                templates = SIDE_EFFECT_TEMPLATES.get(mod, SIDE_EFFECT_TEMPLATES["default"])
                # Add first 2 relevant templates
                for t in templates[:2]:
                    side_effects.add(t)

        # Add severity-based side effects
        if severity_dist.get("Critical", 0) > 0 or severity_dist.get("High", 0) > 1:
            side_effects.add("고위험 결함 패턴 감지 - 전체 회귀 테스트 권장 (High-risk defect pattern detected - full regression testing recommended)")

        if len(modules_to_check) > 2:
            side_effects.add("다중 모듈 영향 - 크로스 모듈 통합 테스트 필요 (Multiple module impact - cross-module integration testing needed)")

        # Add generic ones if we have too few
        default_effects = SIDE_EFFECT_TEMPLATES["default"]
        while len(side_effects) < 3 and default_effects:
            side_effects.add(default_effects[len(side_effects) % len(default_effects)])

        return list(side_effects)[:6]

    def _determine_risk_level(self, impact_score: float) -> str:
        """Determine risk level based on impact score."""
        if impact_score >= RISK_THRESHOLDS["Critical"]:
            return "Critical"
        elif impact_score >= RISK_THRESHOLDS["High"]:
            return "High"
        elif impact_score >= RISK_THRESHOLDS["Medium"]:
            return "Medium"
        else:
            return "Low"

    def _generate_recommendation(
        self,
        risk_level: str,
        affected_areas: List[str],
        severity_dist: Dict[str, int],
    ) -> str:
        """Generate a human-readable recommendation string."""
        areas_str = ", ".join(affected_areas[:3]) if affected_areas else "the affected modules"

        recommendations = {
            "Critical": (
                f"CRITICAL: This change poses high risk. Immediate comprehensive testing is required "
                f"across {areas_str}. Consider code review by senior engineers and staged rollout. "
                f"Full regression suite must pass before deployment."
            ),
            "High": (
                f"HIGH RISK: Thorough testing recommended for {areas_str}. "
                f"Run integration and regression tests. Consider feature flag for gradual release."
            ),
            "Medium": (
                f"MEDIUM RISK: Standard testing procedures for {areas_str}. "
                f"Ensure unit tests pass and run targeted integration tests for affected modules."
            ),
            "Low": (
                f"LOW RISK: Minimal impact expected. "
                f"Run standard unit tests and smoke tests for {areas_str} before deployment."
            ),
        }
        return recommendations.get(risk_level, recommendations["Low"])

    def _empty_result(self) -> Dict[str, Any]:
        """Return empty result when no similar defects found."""
        return {
            "impact_score": 0.0,
            "risk_level": "Low",
            "affected_areas": [],
            "potential_side_effects": [
                "No historical defects found for comparison",
                "Consider adding more defect data for better analysis",
            ],
            "severity_distribution": {"Critical": 0, "High": 0, "Medium": 0, "Low": 0},
            "recommendation": "Insufficient historical data for impact analysis. Proceed with standard testing procedures.",
        }
