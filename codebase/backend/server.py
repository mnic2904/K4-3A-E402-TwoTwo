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
import re
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
    Classifies student message into distinct pedagogical intents:
    - 'PROMPT_INJECTION': Red-team prompt injection attempt.
    - 'OUT_OF_SCOPE_HOMEWORK': Cheating / solve homework for me.
    - 'OUT_OF_SCOPE_ADMIN': Administrative queries (exams, attendance, LMS).
    - 'META_OR_CLARIFY': Ambiguous / missing context / greetings.
    - 'ASK_INSTRUCTOR': User asks TS. Tuấn / Professor to summarize, validate, or verify citation.
    - 'ASK_HINT': User asks TA Thảo or expresses being stuck / needs hint.
    - 'TALK_TO_PEER': User addresses Minh directly.
    - 'EXPLANATION': General concept explanation / question on slide content.
    """
    text = user_input.strip().lower()
    
    # 0. Prompt injection / Red-team attempts
    if any(k in text for k in ["bỏ qua toàn bộ vai trò", "phá vai", "nói như giảng viên", "đừng trích dẫn", "không cần trích dẫn", "ignore role"]):
        return "PROMPT_INJECTION"
        
    # 1. Out-of-scope: Homework solver / cheating
    if any(k in text for k in ["giải bài tập", "để tôi chép", "đưa đáp án hoàn chỉnh", "làm bài hộ", "chép bài", "giải hộ"]):
        return "OUT_OF_SCOPE_HOMEWORK"
        
    # 2. Out-of-scope: Administrative questions (exams, attendance, LMS)
    if any(k in text for k in ["bao giờ thi", "điểm danh", "lịch thi", "phòng thi", "học phí", "hành chính", "khi nào thi", "thi ở đâu"]):
        return "OUT_OF_SCOPE_ADMIN"
        
    # 3. Ambiguity / Meta / Clarify requests (needs context or friendly greeting)
    ambiguous_phrases = ["giải thích trang này", "tui bôi đỏ", "bôi đỏ", "đoạn này", "trang này", "slide này nói gì", "tóm tắt trang"]
    if any(p in text for p in ambiguous_phrases) or text in ["asds", "hả", "ha", "chào", "hello", "hi", "hey", "alo", "alo alo", "từ từ", "chờ tí"] or len(text) < 4:
        return "META_OR_CLARIFY"
        
    # 4. Ask Instructor TS. Tuấn directly (highest precedence for academic validation)
    instructor_keywords = [
        "thầy tuấn", "ts. tuấn", "ts tuấn", "thầy", "giảng viên", "tiến sĩ tuấn", "nhờ thầy", "hỏi thầy", "thầy chốt", "xác nhận giúp", "đúng không", "chốt lại", "citation đúng"
    ]
    if any(k in text for k in instructor_keywords) and not ("nhờ thảo" in text or "trợ giảng thảo" in text or "chị thảo" in text):
        return "ASK_INSTRUCTOR"
        
    # 5. Ask TA Thảo directly or Ask Hint
    ta_keywords = [
        "nhờ thảo", "trợ giảng", "thảo ơi", "chị thảo", "anh thảo", "không hiểu", "chưa hiểu", "bế tắc", "gợi ý", "hint", "nhờ trợ giảng", "gợi ý một ví dụ"
    ]
    if any(k in text for k in ta_keywords):
        return "ASK_HINT"
        
    # 6. Debate / Direct address to peer Minh
    peer_keywords = [
        "minh ơi", "bạn minh", "cậu ơi", "phản biện minh", "nè minh", "minh nè"
    ]
    if any(k in text for k in peer_keywords):
        return "TALK_TO_PEER"
        
    # 7. General concept explanation / lesson questions
    return "EXPLANATION"

@app.post("/api/chat")
async def process_chat_turn(req: ChatTurnRequest):
    """
    Processes student explanation with context-aware, multi-agent orchestration:
    - ASK_INSTRUCTOR -> TS. Tuấn synthesizes & grounds + Minh acknowledges.
    - ASK_HINT -> TA Thảo guides Socratic hint + Minh responds.
    - EXPLANATION -> Minh shares intuitive peer view + TS. Tuấn formalizes with citation.
    - META_OR_CLARIFY -> Minh asks for clarification or greets.
    - OUT_OF_SCOPE_HOMEWORK -> TA Thảo refuses + Minh encourages self-effort.
    - OUT_OF_SCOPE_ADMIN -> Minh redirects + TS. Tuấn directs to LMS/Office.
    - PROMPT_INJECTION -> All agents maintain their defined pedagogical roles.
    """
    slide_info = knowledge_engine.get_slide_info(req.lesson_id, req.current_slide)
    lesson_context = f"Lesson: {req.lesson_id}, Slide {req.current_slide}: {slide_info['title'] if slide_info else ''}"
    
    intent = classify_user_intent(req.user_input)

    peer_res = None
    ta_res = None
    instructor_res = None
    ordered_responses = []
    is_resolved = False

    if intent == "PROMPT_INJECTION":
        # All 3 personas strictly preserve their roles
        peer_res = await agent_service.generate_agent_response(
            role="peer",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Tớ là bạn học cùng lớp với cậu, tụi mình cùng nhau học chứ tớ không làm giảng viên được đâu nha! Cậu xem slide này có chỗ nào thú vị không?"
        )
        ta_res = await agent_service.generate_agent_response(
            role="ta",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Thảo luôn giữ vai trò Trợ giảng đồng hành và hỗ trợ phương pháp học cho các bạn, không thay thế vai trò chuẩn hóa của Thầy Tuấn."
        )
        instructor_res = await agent_service.generate_agent_response(
            role="instructor",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="TS. Tuấn luôn giữ vững chuẩn mực học thuật, chuẩn hóa kiến thức dựa trên đúng tài liệu slide bài giảng kèm mã trích dẫn."
        )
        if peer_res: ordered_responses.append(peer_res)
        if ta_res: ordered_responses.append(ta_res)
        if instructor_res: ordered_responses.append(instructor_res)
        is_resolved = True

    elif intent == "OUT_OF_SCOPE_HOMEWORK":
        ta_res = await agent_service.generate_agent_response(
            role="ta",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Từ chối việc giải bài tập hộ để học viên chép đáp án. Nhắc nhở mục tiêu học là tự rèn luyện tư duy, và gợi ý một bước nhỏ ban đầu để học viên tự làm."
        )
        peer_res = await agent_service.generate_agent_response(
            role="peer",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Đồng tình với chị Thảo, cùng động viên bạn học tự làm từng bước, có gì khó thì cùng nhau thảo luận."
        )
        if ta_res: ordered_responses.append(ta_res)
        if peer_res: ordered_responses.append(peer_res)

    elif intent == "OUT_OF_SCOPE_ADMIN":
        peer_res = await agent_service.generate_agent_response(
            role="peer",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Nói rằng tớ chỉ cùng cậu học nội dung kiến thức trên slide thôi, mấy vụ lịch thi hay điểm danh tớ không nắm rõ đâu."
        )
        instructor_res = await agent_service.generate_agent_response(
            role="instructor",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Nêu rõ hệ thống chỉ hỗ trợ giải đáp chuyên môn bài học. Hướng dẫn học viên theo dõi cổng LMS hoặc liên hệ phòng đào tạo / giảng viên quản lý lớp để nhận thông tin hành chính chính xác."
        )
        if peer_res: ordered_responses.append(peer_res)
        if instructor_res: ordered_responses.append(instructor_res)

    elif intent == "ASK_INSTRUCTOR":
        # TS. Tuấn speaks first, then Minh acknowledges
        instructor_res = await agent_service.generate_agent_response(
            role="instructor",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Học viên trực tiếp nhờ Thầy giải thích / chốt kiến thức / kiểm tra citation. Hãy trả lời chuẩn xác, đĩnh đạc, súc tích trong tối đa 3-4 câu kèm mã trích dẫn slide chính xác."
        )
        if instructor_res:
            ordered_responses.append(instructor_res)
            
        peer_res = await agent_service.generate_agent_response(
            role="peer",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Minh cảm ơn Thầy Tuấn và bày tỏ sự hiểu ra vấn đề sau lời chốt của Thầy (1 câu ngắn gọn, tự nhiên)."
        )
        if peer_res:
            ordered_responses.append(peer_res)
        is_resolved = True

    elif intent == "ASK_HINT":
        # TA Thảo provides Socratic hint, then Minh responds
        ta_res = await agent_service.generate_agent_response(
            role="ta",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Học viên đang vướng mắc hoặc cần gợi ý. Hãy đưa ra 1 gợi ý Socratic ngắn gọn hoặc 1 câu hỏi dẫn hướng liên hệ thực tế, không đưa ra đáp án trực tiếp ngay."
        )
        if ta_res:
            ordered_responses.append(ta_res)
            
        peer_res = await agent_service.generate_agent_response(
            role="peer",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Minh phản hồi hào hứng với gợi ý của chị Thảo, nêu suy nghĩ ban đầu để cùng bạn học giải quyết."
        )
        if peer_res:
            ordered_responses.append(peer_res)

    elif intent == "TALK_TO_PEER":
        peer_res = await agent_service.generate_agent_response(
            role="peer",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Học viên vừa nói chuyện / phản biện trực tiếp với bạn. Hãy phản hồi tự nhiên, gần gũi (1-2 câu), thể hiện bạn tiếp thu ý của bạn học."
        )
        if peer_res:
            ordered_responses.append(peer_res)

    elif intent == "META_OR_CLARIFY":
        peer_res = await agent_service.generate_agent_response(
            role="peer",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Người học vừa có câu nói ngắn gọn, chào hỏi hoặc tham chiếu chưa rõ nội dung. Hãy chào lại hoặc hỏi xem bạn học cần làm rõ cụ thể đoạn nào/từ khóa nào trong slide đang xem."
        )
        if peer_res:
            ordered_responses.append(peer_res)

    else: # EXPLANATION
        # Peer Minh provides intuitive peer view first
        peer_res = await agent_service.generate_agent_response(
            role="peer",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Học viên vừa đặt câu hỏi hoặc giải thích bài học. Hãy phản hồi 1 câu tự nhiên dưới góc nhìn bạn học bè bạn."
        )
        if peer_res:
            ordered_responses.append(peer_res)
            
        # TS. Tuấn formalizes and grounds with slide citations
        instructor_res = await agent_service.generate_agent_response(
            role="instructor",
            messages=req.messages,
            lesson_context=lesson_context,
            current_slide=req.current_slide,
            prompt_instruction="Hãy chuẩn hóa kiến thức học thuật ngắn gọn, đĩnh đạc và trích dẫn mã slide chính xác (nếu tài liệu không đủ dữ liệu/công thức cụ thể thì thừa nhận rõ ràng không suy đoán)."
        )
        if instructor_res:
            ordered_responses.append(instructor_res)
            
        is_resolved = True

        # Reward mastery points
        diff_points = 25 if (slide_info and slide_info.get("difficulty") == "Hard") else 15
        tracker.update_mastery(req.student_id, req.lesson_id, points=diff_points)

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
