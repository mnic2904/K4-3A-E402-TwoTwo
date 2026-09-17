"""
Slide Knowledge Engine (Track D.1)
Extracts and indexes text and concept representations from real course slides
(d1-slide-hackathon.pdf & d2-slide-hackathon.pdf).
Provides real-time slide content lookup and difficulty assessment for adaptive AI questioning.
"""

import os
import re
from typing import Dict, Any, Optional, List
import pypdf

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "vlearn-pack", "slides"))

class SlideKnowledgeEngine:
    def __init__(self):
        self.d1_path = os.path.join(DATA_DIR, "d1-slide-hackathon.pdf")
        self.d2_path = os.path.join(DATA_DIR, "d2-slide-hackathon.pdf")
        self.slides_cache: Dict[str, Dict[int, Dict[str, Any]]] = {
            "lesson-01": {},
            "lesson-02": {}
        }
        self._load_and_index_slides()

    def _load_and_index_slides(self):
        # 1. Index Day 1
        if os.path.exists(self.d1_path):
            self.slides_cache["lesson-01"] = self._extract_pdf_slides(self.d1_path, "lesson-01")
        
        # 2. Index Day 2
        if os.path.exists(self.d2_path):
            self.slides_cache["lesson-02"] = self._extract_pdf_slides(self.d2_path, "lesson-02")

    def _extract_pdf_slides(self, pdf_path: str, lesson_id: str) -> Dict[int, Dict[str, Any]]:
        extracted = {}
        try:
            reader = pypdf.PdfReader(pdf_path)
            total_pages = len(reader.pages)
            for idx, page in enumerate(reader.pages):
                page_num = idx + 1
                raw_text = page.extract_text() or ""
                lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
                
                title = lines[0] if lines else f"Slide {page_num}"
                # Clean header numbers or artifacts
                title = re.sub(r'^\d+[\.\s\-]+', '', title).strip()
                if len(title) > 60:
                    title = title[:60] + "..."

                content = " ".join(lines)
                
                # Assess conceptual depth and difficulty
                difficulty = self._assess_difficulty(content, page_num, total_pages)
                is_core_concept = self._check_is_core_concept(content, page_num)

                extracted[page_num] = {
                    "page": page_num,
                    "title": title if title else f"Slide {page_num}: Khái Niệm Chính",
                    "content": content,
                    "lines": lines,
                    "difficulty": difficulty,
                    "is_core_concept": is_core_concept,
                    "citation_code": f"T{'01' if lesson_id == 'lesson-01' else '02'}-{page_num:03d}"
                }
        except Exception as e:
            print(f"[SLIDE_KNOWLEDGE] Error extracting {pdf_path}: {e}")
        return extracted

    def _assess_difficulty(self, text: str, page_num: int, total_pages: int) -> str:
        lower = text.lower()
        # Hard keywords (Math, formulas, architecture, trade-offs)
        if any(w in lower for w in ["attention", "ma trận", "softmax", "vector", "q, k, v", "cost of error", "trade-off", "human-in-the-loop", "hallucination"]):
            return "Hard"
        # Medium keywords (Mechanisms, comparison, tokenization, formulation)
        elif any(w in lower for w in ["token", "embedding", "rule-based", "fine-tuning", "prompt", "phân loại", "đóng khung"]):
            return "Medium"
        # Easy (Intro, overview, summary)
        else:
            if page_num <= 3 or page_num >= total_pages - 2:
                return "Easy"
            return "Medium"

    def _check_is_core_concept(self, text: str, page_num: int) -> bool:
        lower = text.lower()
        core_terms = ["attention", "q, k, v", "token", "tính toán", "đóng khung", "khi nào cần", "cost of error", "human in the loop", "rủi ro"]
        return any(term in lower for term in core_terms) or len(text.strip()) > 150

    def get_slide_info(self, lesson_id: str, slide_num: int) -> Optional[Dict[str, Any]]:
        lesson_data = self.slides_cache.get(lesson_id, {})
        if slide_num in lesson_data:
            return lesson_data[slide_num]
        return None

    def get_all_slides(self, lesson_id: str) -> List[Dict[str, Any]]:
        lesson_data = self.slides_cache.get(lesson_id, {})
        return [lesson_data[k] for k in sorted(lesson_data.keys())]

knowledge_engine = SlideKnowledgeEngine()
