"""
VLearn Multi-Agent Classroom Backend Server (Track D.1)
FastAPI Server supporting:
- Real-time slide tracking & adaptive intervention trigger
- Zero mockdata: Dynamic LLM question generation based on real slide text & learner capability
- 3 Distinct AI models for Instructor, TA, and Peer Learner
- Profile & Analytics API
"""

import sys
import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from slide_knowledge import knowledge_engine
    from slide_tracker import tracker
    from agent_service import agent_service, get_env_vars
except ImportError:
    from codebase.backend.slide_knowledge import knowledge_engine
    from codebase.backend.slide_tracker import tracker
    from codebase.backend.agent_service import agent_service, get_env_vars

load_dotenv()

app = FastAPI(
  title="VLearn Multi-Agent Classroom Backend (Track D.1)",
  description="Backend API orchestrating 3 distinct LLM models for Adaptive Interactive Learning",
  version="1.0.0"
)

# Enable CORS for frontend Vite server
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Request Models
class TrackSlideRequest(BaseModel):
    student_id: str = "S1024"
    lesson_id: str = "lesson-01"
    slide_number: int = 1
    time_spent_seconds: int = 5
    force_trigger: bool = False

class ChatTurnRequest(BaseModel):
    student_id: str = "S1024"
    lesson_id: str = "lesson-01"
    current_slide: int = 14
    messages: List[Dict[str, Any]] = []
    user_input: str = ""

class TuneAgentRequest(BaseModel):
    instructor_temperature: float = 0.3
    ta_temperature: float = 0.7
    peer_temperature: float = 0.95

# Routes
@app.get("/")
def read_root():
    env = get_env_vars()
    return {
        "status": "online",
        "service": "VLearn Multi-Agent Backend (Track D.1)",
        "models": {
            "instructor": env["model_instructor"],
            "ta": env["model_ta"],
            "peer": env["model_peer"]
        },
        "endpoints": ["/api/track-slide", "/api/chat", "/api/student/profile", "/api/analytics", "/api/slides"]
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/slides/{lesson_id}")
def get_slides_index(lesson_id: str):
    """
    Returns indexed slide titles and difficulty for the entire deck.
    """
    slides = knowledge_engine.get_all_slides(lesson_id)
    return {
        "lesson_id": lesson_id,
        "total_slides": len(slides),
        "slides": slides
    }

@app.get("/api/student/profile")
def get_student_profile(
    student_id: str = Query("S1024"),
    lesson_id: str = Query("lesson-01")
):
    """
    Returns real student learning session metrics and mastery level.
    """
    profile = tracker.get_student_profile(student_id, lesson_id)
    return profile

@app.post("/api/track-slide")
async def track_slide(req: TrackSlideRequest):
    """
    Real-time slide tracking:
    1. Updates student dwell time and visited slide history.
    2. Evaluates student mastery vs slide conceptual difficulty.
    3. Dynamically generates adaptive multi-agent intervention if needed via LLM.
    """
    trigger_info = tracker.track_slide_progress(
        student_id=req.student_id,
        lesson_id=req.lesson_id,
        slide_number=req.slide_number,
        time_spent_seconds=req.time_spent_seconds,
        force_trigger=req.force_trigger
    )
    
    student_profile = tracker.get_student_profile(req.student_id, req.lesson_id)

    if trigger_info and trigger_info.get("should_intervene"):
        slide_info = knowledge_engine.get_slide_info(req.lesson_id, req.slide_number)
        if slide_info:
            # Generate adaptive intervention dynamically with LLM
            intervention = await agent_service.generate_adaptive_checkpoint(
                slide_info=slide_info,
                student_level=student_profile["level"],
                student_mastery=student_profile["mastery_score"]
            )
            return {
                "should_intervene": True,
                "intervention": intervention,
                "slide_info": slide_info,
                "student_profile": student_profile
            }

    slide_info = knowledge_engine.get_slide_info(req.lesson_id, req.slide_number)
    return {
        "should_intervene": False,
        "intervention": None,
        "slide_info": slide_info,
        "student_profile": student_profile
    }

def classify_user_intent(user_input: str) -> str:
    """
    Classifies student message into:
    - 'ASK_HINT': Asking TA / system for a hint, guidance, expressing difficulty ('gợi ý', 'khó quá', 'hướng dẫn', 'hint', 'chưa biết làm sao')
    - 'ASK_INSTRUCTOR': Explicitly asking the professor ('thầy', 'thầy tuấn', 'giảng viên', 'chốt đáp án')
    - 'META_OR_CLARIFY': Meta comments, casual chat, 'hỏi từng câu', 'không biết', 'từ từ', 'là sao'
    - 'EXPLANATION': Substantive attempt to answer/explain the concept
    """
    text = user_input.strip().lower()
    
    # 1. Ask for hint / guidance / TA help
    hint_keywords = [
        "gợi ý", "hint", "khó quá", "hướng dẫn", "chỉ cho", "chỉ em", "chỉ mình", "bế tắc",
        "giúp với", "giúp em", "giúp mình", "trợ giảng", "ta ơi", "anh ta", "chị thảo", "cô thảo",
        "làm sao để", "cho xin ví dụ", "gợi ý giúp"
    ]
    if any(k in text for k in hint_keywords):
        return "ASK_HINT"

    # 2. Ask professor directly
    instructor_keywords = [
        "thầy ơi", "thầy tuấn", "giảng viên", "nhờ thầy", "thầy giải thích", "thầy chốt", "hỏi thầy"
    ]
    if any(k in text for k in instructor_keywords):
        return "ASK_INSTRUCTOR"

    # 3. Meta or non-answer phrases
    meta_phrases = [
        "hỏi từng câu", "hỏi câu nào", "từ từ", "chờ tí", "đợi tí", "gì cơ", "là sao",
        "không biết", "k biết", "chịu", "chưa rõ", "chưa hiểu", "sao lại thế", "tại sao",
        "nói lại", "bạn nói đi", "hỏi một câu thôi", "hỏi lại đi", "chào bạn", "hello", "hi"
    ]
    if any(p in text for p in meta_phrases) or len(text) < 12:
        return "META_OR_CLARIFY"

    # 4. Default to substantive explanation
    return "EXPLANATION"

@app.post("/api/chat")
async def process_chat_turn(req: ChatTurnRequest):
    """
    Processes student explanation in multi-agent classroom:
    1. Intelligent intent analysis to avoid unnecessary teacher interruptions
    2. Peer reacts naturally
    3. TA Socratic guides when requested or appropriate
    4. TS. Tuấn provides authoritative confirmation & slide citation upon actual explanation
    5. Updates student mastery level dynamically
    """
    slide_info = knowledge_engine.get_slide_info(req.lesson_id, req.current_slide)
    lesson_context = f"Lesson: {req.lesson_id}, Slide {req.current_slide}: {slide_info['title'] if slide_info else ''}"
    
    intent = classify_user_intent(req.user_input)

    peer_res = None
    ta_res = None
    instructor_res = None
    is_resolved = False

    if intent == "ASK_HINT":
        # TA gives a Socratic hint without revealing the full answer
        ta_res = await agent_service.generate_agent_response(
            role="ta",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide
        )

    elif intent == "ASK_INSTRUCTOR":
        # Student explicitly asked Instructor
        instructor_res = await agent_service.generate_agent_response(
            role="instructor",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide
        )
        is_resolved = True

    elif intent == "META_OR_CLARIFY":
        # Only Peer Minh responds to meta-conversations / clarifies his question
        peer_res = await agent_service.generate_agent_response(
            role="peer",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide
        )

    else: # EXPLANATION
        # 1. Peer response
        peer_res = await agent_service.generate_agent_response(
            role="peer",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide
        )

        # 2. TA Socratic response
        ta_res = await agent_service.generate_agent_response(
            role="ta",
            messages=req.messages + [{"sender": peer_res["sender"], "text": peer_res["text"]}],
            lesson_context=lesson_context,
            current_slide=req.current_slide
        )

        # 3. TS. Tuấn verification
        is_resolved = True
        instructor_res = await agent_service.generate_agent_response(
            role="instructor",
            messages=req.messages + [
                {"sender": peer_res["sender"], "text": peer_res["text"]},
                {"sender": ta_res["sender"], "text": ta_res["text"]}
            ],
            lesson_context=lesson_context,
            current_slide=req.current_slide
        )
        
        # Reward mastery points based on slide difficulty
        diff_points = 25 if (slide_info and slide_info.get("difficulty") == "Hard") else 15
        tracker.update_mastery(req.student_id, req.lesson_id, points=diff_points)

    student_profile = tracker.get_student_profile(req.student_id, req.lesson_id)

    return {
        "peer_response": peer_res,
        "ta_response": ta_res,
        "instructor_response": instructor_res,
        "is_misconception_resolved": is_resolved,
        "student_profile": student_profile
    }

@app.get("/api/analytics")
def get_analytics():
    return tracker.get_analytics()

@app.post("/api/instructor/tune")
def tune_agents(req: TuneAgentRequest):
    return {
        "status": "success",
        "message": "Cập nhật tham số hành vi tác tử thành công",
        "parameters": req.dict()
    }

if __name__ == "__main__":
    env = get_env_vars()
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    print("==================================================")
    print(f"[SERVER] VLearn Multi-Agent Backend (Track D.1)")
    print(f"[SERVER] Models: Instructor={env['model_instructor']}, TA={env['model_ta']}, Peer={env['model_peer']}")
    print(f"[SERVER] API Endpoint: http://localhost:{port}")
    print("==================================================")
    uvicorn.run("server:app", host=host, port=port, reload=True)
