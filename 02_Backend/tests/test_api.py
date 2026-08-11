import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.version import APP_VERSION

client = TestClient(app)


def test_root_labels_the_service_as_a_scaffold():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["version"] == APP_VERSION
    assert response.json()["status"] == "architecture-scaffold"
    assert response.json()["connected_to_web_app"] is False


def test_api_recommend_missions():
    payload = {
        "education_level": "LOWER_SECONDARY",
        "interests": ["ดิจิทัล", "ซอฟต์แวร์"],
        "limit": 3
    }
    response = client.post("/v1/missions/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "missions" in data
    assert len(data["missions"]) <= 3


def test_api_submit_mission():
    payload = {
        "mission_id": "mission_01_tech",
        "answers": [
            {"id": 1, "text": "เมื่อเจอปัญหาวางแผนและสร้างระบบแก้ปัญหาได้สำเร็จ ผลลัพธ์ได้รับรางวัล"}
        ],
        "student_id": "student_test_01"
    }
    response = client.post("/v1/missions/mission_01_tech/submissions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "result" in data
    assert data["result"]["score"] > 0.0


def test_legacy_future_path_is_disabled_by_default():
    payload = {
        "education_level": "LOWER_SECONDARY",
        "interest_profile": {
            "riasec_scores": {"R": 0.8, "I": 0.9, "A": 0.5, "S": 0.4, "E": 0.6, "C": 0.7},
            "interest_tags": ["ซอฟต์แวร์", "หุ่นยนต์"],
            "preferred_fields": ["วิศวกรรมคอมพิวเตอร์"]
        },
        "evidence": {
            "academic_strengths": ["คณิตศาสตร์", "ฟิสิกส์"],
            "star_responses": [
                {"id": 1, "text": "เมื่อเจอปัญหาหุ่นยนต์ขัดข้อง ได้วางแผนปรับแก้โค้ดและทดสอบใหม่สำเร็จ"}
            ],
            "practical_experience": ["เข้าชมรมคอมพิวเตอร์"]
        }
    }

    create_res = client.post("/v1/future-paths", json=payload)
    assert create_res.status_code == 501
    assert "not backed by validated" in create_res.json()["detail"]
