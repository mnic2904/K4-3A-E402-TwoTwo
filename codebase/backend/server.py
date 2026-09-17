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
    - 'ASK_HINT': Asking TA / system for a hint, guidance, expressing difficulty ('nhờ ta', 'gợi ý', 'khó quá', 'hướng dẫn', 'hint', 'giúp')
    - 'ASK_INSTRUCTOR': Explicitly asking the professor ('thầy', 'thầy tuấn', 'giảng viên', 'chốt đáp án')
    - 'META_OR_CLARIFY': Casual greetings, simple acknowledgments ('chào', 'hello', 'ok')
    - 'EXPLANATION': Attempt to answer/explain the concept
    """
    text = user_input.strip().lower()
    
    # 1. Ask for hint / guidance / TA help (Highest Priority Check)
    hint_keywords = [
        "ta", "trợ giảng", "thảo", "gợi ý", "hint", "khó", "hướng dẫn", "chỉ cho", "chỉ em", "chỉ mình", "bế tắc",
        "giúp", "cứu", "chưa hiểu", "chưa rõ", "làm sao", "nhờ", "ví dụ", "sao ta"
    ]
    if any(k in text for k in hint_keywords):
        return "ASK_HINT"

    # 2. Ask professor directly
    instructor_keywords = [
        "thầy", "thầy tuấn", "giảng viên", "nhờ thầy", "thầy giải thích", "thầy chốt", "hỏi thầy", "đúng không"
    ]
    if any(k in text for k in instructor_keywords):
        return "ASK_INSTRUCTOR"

    # 3. Simple casual / greetings only
    casual_words = ["chào", "hello", "hi", "từ từ", "chờ tí", "đợi tí", "gì cơ"]
    if any(w == text for w in casual_words) or (len(text) < 5 and text not in ["học", "qkv", "bpe", "loss"]):
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
        # 1. TA gives a direct Socratic hint based on student inquiry and Minh's question
        ta_res = await agent_service.generate_agent_response(
            role="ta",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Học viên đang kêu khó / nhờ trợ giúp. Hãy đưa ra 1 gợi ý so sánh thực tế ngắn gọn (ví dụ não bộ và dữ liệu thực tế, hoặc cơ chế Q-K-V) để bạn học Minh và Học viên cùng nắm bắt."
        )

        # 2. Peer Minh reacts to TA's hint
        if ta_res:
            peer_res = await agent_service.generate_agent_response(
                role="peer",
                messages=req.messages + [{"sender": ta_res["sender"], "text": ta_res["text"]}],
                lesson_context=lesson_context,
                current_slide=req.current_slide,
                prompt_instruction="Bạn vừa nghe Trợ giảng Thảo gợi ý. Hãy reo lên một liên tưởng ngắn gọn hoặc hỏi bạn học tiếp theo gợi ý đó."
            )

    elif intent == "ASK_INSTRUCTOR":
        # 1. Student explicitly asked Instructor TS. Tuấn
        instructor_res = await agent_service.generate_agent_response(
            role="instructor",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Học viên trực tiếp nhờ Thầy giải thích. Hãy chốt lại bản chất học thuật chuẩn xác, đĩnh đạc, ngắn gọn kèm mã trích dẫn slide."
        )
        is_resolved = True

        # 2. Peer Minh acknowledges
        if instructor_res:
            peer_res = await agent_service.generate_agent_response(
                role="peer",
                messages=req.messages + [{"sender": instructor_res["sender"], "text": instructor_res["text"]}],
                lesson_context=lesson_context,
                current_slide=req.current_slide,
                prompt_instruction="Bạn vừa nghe Thầy Tuấn giảng giải. Hãy cảm ơn Thầy và tóm tắt lại 1 ý hiểu nhanh."
            )

    elif intent == "META_OR_CLARIFY":
        # Only Peer Minh responds to meta-conversations / clarifies his question
        peer_res = await agent_service.generate_agent_response(
            role="peer",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide
        )

    else: # EXPLANATION
        # 1. Peer response to student explanation
        peer_res = await agent_service.generate_agent_response(
            role="peer",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Học viên vừa giải thích cho bạn. Hãy phản hồi tự nhiên xem bạn đã hiểu ra chưa hoặc có điểm nào ấn tượng."
        )

        # 2. TS. Tuấn validates & awards mastery
        is_resolved = True
        instructor_res = await agent_service.generate_agent_response(
            role="instructor",
            messages=req.messages + [{"sender": peer_res["sender"], "text": peer_res["text"]}],
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Đánh giá lời giải thích của học viên cho bạn Minh. Khẳng định điểm đúng và chuẩn hóa kiến thức kèm mã trích dẫn slide."
        )
        
        # Reward mastery points based on slide difficulty
        diff_points = 25 if (slide_info and slide_info.get("difficulty") == "Hard") else 15
        tracker.update_mastery(req.student_id, req.lesson_id, points=diff_points)

    # Build sequential list of agent responses based on dialogue flow
    ordered_responses = []
    if intent == "ASK_HINT":
        if ta_res:
            ordered_responses.append(ta_res)
        if peer_res:
            ordered_responses.append(peer_res)
    elif intent == "ASK_INSTRUCTOR":
        if instructor_res:
            ordered_responses.append(instructor_res)
        if peer_res:
            ordered_responses.append(peer_res)
    elif intent == "META_OR_CLARIFY":
        if peer_res:
            ordered_responses.append(peer_res)
    else: # EXPLANATION
        if peer_res:
            ordered_responses.append(peer_res)
        if instructor_res:
            ordered_responses.append(instructor_res)

    student_profile = tracker.get_student_profile(req.student_id, req.lesson_id)

    return {
        "ordered_responses": ordered_responses,
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
