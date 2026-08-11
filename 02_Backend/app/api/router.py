import uuid
import os
from typing import Dict, List
from fastapi import APIRouter, HTTPException, status

from schemas.models import (
    EducationLevel,
    ExplorationMission,
    MissionRecommendRequest,
    MissionRecommendResponse,
    MissionSubmissionRequest,
    MissionSubmissionResponse,
    MissionResult,
    FuturePathRequest,
    FuturePathResponse,
    FuturePathNode,
)
from app.decision_engine import (
    RIASECScorer,
    STAREvaluator,
    MultiTierRouter,
    DecisionMatrixCalculator,
    RouteGenerator,
)

router = APIRouter(prefix="/v1", tags=["FutureMe backend scaffold"])

# The historical Python matrix assigns default feasibility and flexibility
# values that have no validated source. Keep the code inspectable, but never
# expose its recommendation output accidentally.
LEGACY_FUTURE_PATHS_ENABLED = os.getenv("FUTUREME_ENABLE_LEGACY_BACKEND", "").strip() == "1"

# In-memory storage for future path nodes
future_paths_db: Dict[str, FuturePathNode] = {}

# Services initialization
riasec_scorer = RIASECScorer()
star_evaluator = STAREvaluator()
multi_tier_router = MultiTierRouter() if LEGACY_FUTURE_PATHS_ENABLED else None
matrix_calculator = DecisionMatrixCalculator() if LEGACY_FUTURE_PATHS_ENABLED else None
route_generator = RouteGenerator() if LEGACY_FUTURE_PATHS_ENABLED else None


@router.post("/missions/recommend", response_model=MissionRecommendResponse)
def recommend_missions(payload: MissionRecommendRequest):
    """
    Accepts user education level & interests, returns recommended exploration missions.
    """
    missions = [
        ExplorationMission(
            mission_id="mission_01_tech",
            title="สำรวจเส้นทางปัญญาประดิษฐ์และซอฟต์แวร์แห่งอนาคต",
            description="ทดลองออกแบบแนวคิดแอปพลิเคชันเพื่อแก้ปัญหาการเรียนและพัฒนาทักษะดิจิทัล",
            target_grade_level=payload.education_level,
            difficulty="Medium",
            questions=[
                {"id": 1, "question": "หากคุณสามารถสร้างแอปพลิเคชันได้ 1 แอป แอปนั้นจะทำอะไรและช่วยใคร?"},
                {"id": 2, "question": "อธิบายขั้นตอนที่คุณจะใช้ในการทดลองสร้างแอปพลิเคชันนั้น?"}
            ]
        ),
        ExplorationMission(
            mission_id="mission_02_vocational",
            title="สำรวจเส้นทางอาชีวศึกษาและทวิภาคี",
            description="ทำความเข้าใจเส้นทางเรียนสายอาชีพ โอกาสทำงานจริง และการเรียนระบบทวิภาคี (DVE)",
            target_grade_level=payload.education_level,
            difficulty="Easy",
            questions=[
                {"id": 1, "question": "คุณสนใจสาขาอาชีวศึกษาใดมากที่สุด และจะตรวจข้อมูลหลักสูตรปัจจุบันจากที่ใด?"},
                {"id": 2, "question": "คุณคิดว่าการเรียนระบบทวิภาคี (เรียนคู่ฝึกงาน) เหมาะกับคุณอย่างไร?"}
            ]
        ),
        ExplorationMission(
            mission_id="mission_03_tcas",
            title="วางแผนสำรวจเส้นทาง TCAS",
            description="ค้นหาคณะที่สนใจและตรวจเกณฑ์รับสมัครปัจจุบันจากแหล่งทางการ",
            target_grade_level=payload.education_level,
            difficulty="Hard",
            questions=[
                {"id": 1, "question": "คณะที่คุณสนใจต้องตรวจสอบคะแนนหรือคุณสมบัติใดจากประกาศทางการ?"},
                {"id": 2, "question": "คุณมีแผน 30 วันอย่างไรในการเตรียม Portfolio หรือคะแนนสอบ?"}
            ]
        )
    ]
    
    limited_missions = missions[:payload.limit]
    return MissionRecommendResponse(
        missions=limited_missions,
        total=len(limited_missions)
    )


@router.post("/missions/{id}/submissions", response_model=MissionSubmissionResponse)
def submit_mission(id: str, payload: MissionSubmissionRequest):
    """
    Accepts student mission answers, returns evaluation & adaptive next questions.
    """
    eval_res = star_evaluator.evaluate_answers(payload.answers)
    
    result = MissionResult(
        submission_id=f"sub_{uuid.uuid4().hex[:8]}",
        mission_id=id,
        score=eval_res["score"],
        feedback=eval_res["feedback"],
        recommended_next_step=(
            "ใช้เว็บแอป 03_WebApp สำหรับกระบวนการปัจจุบัน "
            "และตรวจสอบข้อมูลทางการก่อนตัดสินใจ"
        )
    )
    
    return MissionSubmissionResponse(
        result=result,
        adaptive_questions=eval_res["adaptive_questions"]
    )


@router.post("/future-paths", response_model=FuturePathResponse)
def create_future_path(payload: FuturePathRequest):
    """
    Legacy endpoint. It refuses by default; an explicit local research opt-in exposes
    three unvalidated historical alternatives.
    """
    if not LEGACY_FUTURE_PATHS_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=(
                "Legacy backend recommendations are disabled: their feasibility and "
                "flexibility defaults are not backed by validated programme-level data. "
                "Use the 03_WebApp deterministic prototype for the current product."
            ),
        )

    assert multi_tier_router is not None
    assert matrix_calculator is not None
    assert route_generator is not None

    # 1. RIASEC Scorer
    top_codes = riasec_scorer.get_top_codes(payload.interest_profile.riasec_scores)
    
    # 2. STAR Evaluator
    star_res = star_evaluator.evaluate_answers(payload.evidence.star_responses)
    
    # 3. Multi-tier Router
    tier_info = multi_tier_router.route(
        level=payload.education_level,
        riasec_top=top_codes,
        interests=payload.interest_profile.interest_tags
    )
    
    # 4. Decision Matrix Calculator (5 weights)
    matrix_res = matrix_calculator.calculate_matrix(
        profile=payload.interest_profile,
        evidence=payload.evidence,
        star_score=star_res["score"]
    )
    
    # 5. Route Generator (3 routes)
    routes = route_generator.generate_routes(
        level=payload.education_level,
        profile=payload.interest_profile,
        evidence=payload.evidence,
        matrix_result=matrix_res,
        tier_info=tier_info
    )
    
    path_id = f"path_{uuid.uuid4().hex[:8]}"
    node = FuturePathNode(
        path_id=path_id,
        profile=payload.interest_profile,
        evidence=payload.evidence,
        evaluation_matrix=matrix_res["itemized_scores"],
        route_options=routes
    )
    
    future_paths_db[path_id] = node
    return FuturePathResponse(path_node=node)


@router.get("/future-paths/{id}", response_model=FuturePathNode)
def get_future_path(id: str):
    """
    Reads an opted-in legacy result from the current in-memory process only.
    """
    if not LEGACY_FUTURE_PATHS_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Legacy backend recommendations are disabled in the current prototype.",
        )
    if id not in future_paths_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FuturePath node with ID '{id}' not found."
        )
    return future_paths_db[id]
