"""
Multi-Agent Orchestration Service (Track D.1)
Coordinates the 3 distinct AI models for Instructor, TA, and Peer Learner.
Provides:
1. Context-Aware Multi-Agent Dialogue: Every agent observes the full conversation transcript and responds coherently.
2. Dynamic Adaptive Checkpoint Generation based on real slide content.
3. Resilient 9router / OpenAI-compatible integration with dual JSON/SSE stream handling.
"""

import os
import json
import re
from typing import List, Dict, Any, Optional
import httpx
from dotenv import load_dotenv

# Robust import handling
try:
    from prompts import PROMPT_INSTRUCTOR, PROMPT_TA, PROMPT_PEER
except ImportError:
    from codebase.backend.prompts import PROMPT_INSTRUCTOR, PROMPT_TA, PROMPT_PEER

load_dotenv()

def get_env_vars():
    load_dotenv()
    return {
        "api_key": os.getenv("GEMINI_API_KEY", ""),
        "base_url": os.getenv("OPENAI_BASE_URL", "http://127.0.0.1:20128/v1").rstrip('/'),
        "model_instructor": os.getenv("MODEL_INSTRUCTOR", "ag/gemini-3.7-flash-high"),
        "model_ta": os.getenv("MODEL_TA", "ag/gemini-3.7-flash-medium"),
        "model_peer": os.getenv("MODEL_PEER", "ag/gemini-3.7-flash-low")
    }

class AgentService:
    def __init__(self):
        env = get_env_vars()
        self.api_key = env["api_key"]
        self.base_url = env["base_url"]
        print(f"[AGENT_SERVICE] Service initialized with 3 models:")
        print(f"  - Instructor: {env['model_instructor']}")
        print(f"  - TA Socratic: {env['model_ta']}")
        print(f"  - Peer Learner: {env['model_peer']}")
        print(f"  - Base URL / 9router: {self.base_url}")

    def _build_classroom_transcript(self, messages: List[Dict[str, Any]]) -> str:
        """
        Formats message list into an unambiguous, speaker-tagged classroom transcript.
        """
        lines = []
        speaker_map = {
            "user": "Học viên (Người dùng)",
            "peer-minh": "Bạn học Minh",
            "ta-thao": "Trợ giảng Thảo",
            "prof-tuan": "TS. Tuấn (Giảng viên)"
        }

        for m in messages[-8:]:
            sender_key = m.get("sender", "user")
            speaker_name = speaker_map.get(sender_key, "Học viên")
            text = m.get("text", "").strip()
            if text:
                lines.append(f"[{speaker_name}]: {text}")

        return "\n".join(lines) if lines else "[Chưa có trao đổi nào trước đó]"

    async def _call_openai_compatible_api(
        self, 
        model: str, 
        system_prompt: str, 
        user_prompt: str, 
        temperature: float,
        max_tokens: int = 250
    ) -> Optional[str]:
        """
        Calls 9router or OpenAI-compatible endpoint with timeout and dual JSON/SSE handling.
        """
        env = get_env_vars()
        api_key = env["api_key"]
        base_url = env["base_url"]

        if not api_key:
            return None

        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        api_messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        payload = {
            "model": model,
            "messages": api_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as http_client:
                response = await http_client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    raw_text = response.text.strip()
                    # Case 1: Standard JSON completion
                    try:
                        data = json.loads(raw_text)
                        choices = data.get("choices", [])
                        if choices and "message" in choices[0]:
                            return choices[0]["message"].get("content", "").strip()
                    except json.JSONDecodeError:
                        # Case 2: SSE stream chunks if returned by proxy
                        content_pieces = []
                        for line in raw_text.splitlines():
                            line = line.strip()
                            if line.startswith("data: ") and line != "data: [DONE]":
                                try:
                                    chunk = json.loads(line[6:])
                                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                                    if "content" in delta:
                                        content_pieces.append(delta["content"])
                                except Exception:
                                    continue
                        if content_pieces:
                            return "".join(content_pieces).strip()
                else:
                    print(f"[AGENT_SERVICE] Proxy returned status {response.status_code}: {response.text[:120]}")
        except Exception as e:
            print(f"[AGENT_SERVICE] API connection notice: {e}")

        return None

    async def generate_adaptive_checkpoint(
        self,
        slide_info: Dict[str, Any],
        student_level: str = "Beginner",
        student_mastery: int = 40
    ) -> Dict[str, Any]:
        """
        Generates a contextual misconception / inquiry from Peer Minh based on real slide content.
        """
        env = get_env_vars()
        slide_title = slide_info.get("title", f"Slide {slide_info.get('page')}")
        slide_content = slide_info.get("content", "")
        citation = slide_info.get("citation_code", "T01-001")
        difficulty = slide_info.get("difficulty", "Medium")

        system_prompt = (
            f"{PROMPT_PEER}\n\n"
            f"--- BỐI CẢNH BÀI HỌC ---\n"
            f"Người học đang ở trình độ: {student_level} (Mastery: {student_mastery}/100).\n"
            f"Slide {slide_info.get('page')}: '{slide_title}'.\n"
            f"Nội dung trọng tâm: \"{slide_content[:350]}\".\n"
        )

        user_prompt = (
            f"Hãy đặt 1 câu hỏi ngây thơ hoặc nêu 1 ngộ nhận trực quan tự nhiên về nội dung Slide {slide_info.get('page')} này "
            f"để bạn học giải thích giúp bạn. Bắt buộc dài 1 đến 2 câu ngắn gọn, xưng hô cậu - tớ/mình - bạn."
        )

        minh_text = await self._call_openai_compatible_api(
            model=env["model_peer"],
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.85,
            max_tokens=90
        )

        if not minh_text:
            minh_text = f"Ủa cậu ơi, mình đang xem Slide {slide_info.get('page')} về '{slide_title}', phần này áp dụng thế nào vậy cậu giải thích giúp mình với?"

        return {
            "should_intervene": True,
            "slide_number": slide_info.get("page"),
            "concept": slide_title,
            "misconception_title": f"Thảo luận: {slide_title}",
            "citation": citation,
            "primary_speaker": "peer-minh",
            "message": minh_text,
            "difficulty": difficulty,
            "student_level": student_level,
            "icap_target": "Constructive"
        }

    async def generate_agent_response(
        self, 
        role: str, # 'instructor' | 'ta' | 'peer'
        messages: List[Dict[str, Any]], 
        lesson_context: str = "",
        current_slide: int = 14,
        prompt_instruction: str = ""
    ) -> Dict[str, Any]:
        """
        Dispatches request to the distinct model for the specified role with the full classroom transcript.
        """
        env = get_env_vars()
        transcript = self._build_classroom_transcript(messages)
        citation_code = f"T01-{current_slide:03d}" if "lesson-01" in lesson_context.lower() else f"T02-{current_slide:03d}"

        if role == 'instructor':
            model_name = env["model_instructor"]
            system_prompt = (
                f"{PROMPT_INSTRUCTOR}\n\n"
                f"--- BỐI CẢNH BÀI HỌC ---\n"
                f"{lesson_context}\n"
                f"Slide hiện tại: Trang {current_slide}\n"
                f"Mã trích dẫn bắt buộc: [{citation_code}]"
            )
            user_prompt = (
                f"--- DIỄN BIẾN LỚP HỌC VỪA QUA ---\n"
                f"{transcript}\n\n"
                f"--- YÊU CẦU CHO TS. TUẤN ---\n"
                f"{prompt_instruction or 'Hãy đọc kỹ diễn biến hội thoại ở trên và đưa ra đánh giá, chuẩn hóa kiến thức chuẩn xác, kèm mã trích dẫn [' + citation_code + '].'}"
            )
            temperature = 0.3
            max_tokens = 200
            agent_id = 'prof-tuan'
            agent_name = 'TS. Tuấn (GDE)'

        elif role == 'ta':
            model_name = env["model_ta"]
            system_prompt = (
                f"{PROMPT_TA}\n\n"
                f"--- BỐI CẢNH BÀI HỌC ---\n"
                f"{lesson_context}\n"
                f"Slide hiện tại: Trang {current_slide}"
            )
            user_prompt = (
                f"--- DIỄN BIẾN LỚP HỌC VỪA QUA ---\n"
                f"{transcript}\n\n"
                f"--- YÊU CẦU CHO TRỢ GIẢNG THẢO ---\n"
                f"{prompt_instruction or 'Hãy đọc kỹ diễn biến hội thoại ở trên. Phản hồi trực tiếp vào nội dung người học vừa nói, đưa ra 1 gợi ý so sánh thực tế ngắn gọn để dẫn dắt, không nói thẳng đáp án.'}"
            )
            temperature = 0.7
            max_tokens = 120
            agent_id = 'ta-thao'
            agent_name = 'Trợ giảng Thảo'

        else: # peer
            model_name = env["model_peer"]
            system_prompt = (
                f"{PROMPT_PEER}\n\n"
                f"--- BỐI CẢNH BÀI HỌC ---\n"
                f"{lesson_context}\n"
                f"Slide hiện tại: Trang {current_slide}"
            )
            user_prompt = (
                f"--- DIỄN BIẾN LỚP HỌC VỪA QUA ---\n"
                f"{transcript}\n\n"
                f"--- YÊU CẦU CHO BẠN HỌC MINH ---\n"
                f"{prompt_instruction or 'Hãy đọc kỹ câu nói gần nhất của Học viên hoặc Trợ giảng/Thầy Tuấn ở trên. Phản hồi lại 1-2 câu ngắn gọn, tự nhiên như bạn cùng lớp.'}"
            )
            temperature = 0.85
            max_tokens = 90
            agent_id = 'peer-minh'
            agent_name = 'Minh (Bạn học)'

        # Call API
        api_text = await self._call_openai_compatible_api(
            model=model_name,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens
        )

        if api_text:
            citation = None
            if role == 'instructor':
                match = re.search(r'\[(T\d{2}-\d{3})\]', api_text)
                citation = match.group(1) if match else citation_code

            return {
                "id": f"{agent_id}-{os.urandom(4).hex()}",
                "sender": agent_id,
                "agent_name": agent_name,
                "model_used": model_name,
                "text": api_text,
                "citation": citation,
                "timestamp": "Vừa xong"
            }

        # Fallback if connection fails
        return self._generate_simulated_response(role, messages, current_slide)

    def _generate_simulated_response(self, role: str, messages: List[Dict[str, str]], current_slide: int) -> Dict[str, Any]:
        env = get_env_vars()
        last_user_msg = ""
        for m in reversed(messages):
            if m.get('sender') == 'user':
                last_user_msg = m.get('text', '')
                break

        last_lower = last_user_msg.lower()

        if role == 'ta':
            if any(k in last_lower for k in ["khó", "giúp", "gợi ý", "chưa hiểu", "sao", "làm sao"]):
                text = f"Để Thảo gợi ý nhé: Thuật toán như một bộ khung, nhưng nếu không có hàng triệu hình ảnh thực tế (như ImageNet) để học các mẫu hình (features), mô hình không thể nhận diện được các đặc trưng phức tạp ngoài đời. Bạn thử liên hệ xem sao?"
            else:
                text = f"Góc nhìn của bạn rất đáng chú ý! Hãy thử kết nối ý này với cơ chế xử lý ở Slide {current_slide} xem Minh có hiểu thêm không nhé."
            return {
                "id": f"ta-thao-{os.urandom(4).hex()}",
                "sender": "ta-thao",
                "agent_name": "Trợ giảng Thảo",
                "model_used": f"{env['model_ta']}",
                "text": text,
                "timestamp": "Vừa xong"
            }

        elif role == 'peer':
            if any(k in last_lower for k in ["khó", "giúp", "chưa rõ"]):
                text = f"Ừ công nhận phần này trừu tượng thật, may có bạn với anh/chị TA cùng bàn luận!"
            else:
                text = f"À ra vậy! Nghe bạn giải thích mình mới vỡ lẽ ra điểm then chốt ở Slide {current_slide}. Cảm ơn bạn nhiều nha!"
            return {
                "id": f"peer-minh-{os.urandom(4).hex()}",
                "sender": "peer-minh",
                "agent_name": "Minh (Bạn học)",
                "model_used": f"{env['model_peer']}",
                "text": text,
                "timestamp": "Vừa xong"
            }

        else: # instructor
            citation = f"T01-{current_slide:03d}"
            text = f"TS. Tuấn xác nhận: Lập luận của các bạn hoàn toàn chuẩn xác theo tài liệu [{citation}]. Dữ liệu quy mô lớn chính là chìa khóa mở ra kỷ nguyên Deep Learning hiện đại."
            return {
                "id": f"prof-tuan-{os.urandom(4).hex()}",
                "sender": "prof-tuan",
                "agent_name": "TS. Tuấn (GDE)",
                "model_used": f"{env['model_instructor']}",
                "text": text,
                "citation": citation,
                "timestamp": "Vừa xong"
            }

agent_service = AgentService()
