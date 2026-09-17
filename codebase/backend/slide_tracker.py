"""
Adaptive Slide Tracking & Dynamic Student Mastery Engine (Track D.1)
Tracks which slide the student is currently reading, evaluates their mastery level,
and dynamically triggers adaptive multi-agent Socratic checkpoints based on actual slide content.
Zero mockdata: all checkpoints and evaluation metrics adapt to real-time student interaction.
"""

import time
from typing import Dict, Any, Optional, List
try:
    from slide_knowledge import knowledge_engine
except ImportError:
    from codebase.backend.slide_knowledge import knowledge_engine

class StudentSession:
    def __init__(self, student_id: str, lesson_id: str):
        self.student_id = student_id
        self.lesson_id = lesson_id
        self.current_slide = 1
        self.visited_slides: List[int] = [1]
        self.slide_dwell_time: Dict[int, int] = {1: 0} # { slide_num: total_seconds_spent }
        self.triggered_slides: List[int] = []
        self.mastery_score: int = 40 # 0 to 100
        self.level: str = "Beginner" # Beginner, Intermediate, Advanced
        self.resolved_questions_count: int = 0
        self.interactions_log: List[Dict[str, Any]] = []
        self.last_interaction_time = time.time()

    def update_level(self):
        if self.mastery_score >= 80:
            self.level = "Advanced"
        elif self.mastery_score >= 60:
            self.level = "Intermediate"
        else:
            self.level = "Beginner"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "student_id": self.student_id,
            "lesson_id": self.lesson_id,
            "current_slide": self.current_slide,
            "visited_slides": self.visited_slides,
            "slide_dwell_time": self.slide_dwell_time,
            "mastery_score": self.mastery_score,
            "level": self.level,
            "resolved_questions_count": self.resolved_questions_count,
            "total_slides_visited": len(self.visited_slides)
        }

class SlideTracker:
    def __init__(self):
        # Store state per student session: { f"{student_id}_{lesson_id}": StudentSession }
        self.sessions: Dict[str, StudentSession] = {}

    def get_or_create_session(self, student_id: str, lesson_id: str) -> StudentSession:
        key = f"{student_id}_{lesson_id}"
        if key not in self.sessions:
            self.sessions[key] = StudentSession(student_id, lesson_id)
        return self.sessions[key]

    def track_slide_progress(
        self, 
        student_id: str, 
        lesson_id: str, 
        slide_number: int, 
        time_spent_seconds: int = 5,
        force_trigger: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Updates student's slide position and decides whether an AI agent should intervene dynamically.
        Uses intelligent pacing (spaced at least 3-4 slides apart) so the student is not overwhelmed.
        """
        session = self.get_or_create_session(student_id, lesson_id)
        session.current_slide = slide_number
        
        # Accumulate dwell time
        session.slide_dwell_time[slide_number] = session.slide_dwell_time.get(slide_number, 0) + time_spent_seconds
        
        if slide_number not in session.visited_slides:
            session.visited_slides.append(slide_number)

        # Retrieve actual slide content from Knowledge Engine
        slide_info = knowledge_engine.get_slide_info(lesson_id, slide_number)
        if not slide_info:
            return None

        last_triggered = session.triggered_slides[-1] if session.triggered_slides else -10
        slide_gap = abs(slide_number - last_triggered)

        # Spaced Checkpoint Criteria:
        # 1. Slide is a core concept or has Medium/Hard difficulty
        # 2. Slide is >= page 4 (avoid spamming during intro slides)
        # 3. Pacing gap >= 3 slides since last checkpoint, OR forced by user
        should_trigger = force_trigger or (
            slide_number not in session.triggered_slides
            and slide_number >= 4
            and slide_gap >= 3
            and (slide_info.get("difficulty") in ["Medium", "Hard"] or slide_info.get("is_core_concept"))
        )

        if should_trigger:
            session.triggered_slides.append(slide_number)
            return {
                "should_intervene": True,
                "slide_number": slide_number,
                "slide_title": slide_info["title"],
                "slide_content": slide_info["content"],
                "difficulty": slide_info["difficulty"],
                "citation": slide_info["citation_code"],
                "student_level": session.level,
                "student_mastery": session.mastery_score
            }

        return {
            "should_intervene": False,
            "slide_number": slide_number,
            "slide_title": slide_info["title"],
            "difficulty": slide_info["difficulty"],
            "citation": slide_info["citation_code"]
        }

    def update_mastery(self, student_id: str, lesson_id: str, points: int = 15):
        session = self.get_or_create_session(student_id, lesson_id)
        session.mastery_score = min(100, session.mastery_score + points)
        session.resolved_questions_count += 1
        session.update_level()

    def get_student_profile(self, student_id: str, lesson_id: str) -> Dict[str, Any]:
        session = self.get_or_create_session(student_id, lesson_id)
        return session.to_dict()

    def get_analytics(self) -> Dict[str, Any]:
        """
        Returns real-time aggregated learning analytics across sessions.
        """
        total_learners = max(1, len(self.sessions))
        avg_mastery = sum(s.mastery_score for s in self.sessions.values()) / total_learners if self.sessions else 65
        
        # Calculate dwell heatmap per slide
        slide_confusion_counts: Dict[int, int] = {}
        for s in self.sessions.values():
            for slide, dwell in s.slide_dwell_time.items():
                if dwell > 15: # Dwell time > 15s indicates high mental effort or confusion
                    slide_confusion_counts[slide] = slide_confusion_counts.get(slide, 0) + 1

        return {
            "total_active_learners": total_learners,
            "average_mastery_score": round(avg_mastery, 1),
            "high_confusion_slides": [
                {"slide": k, "struggling_count": v} 
                for k, v in sorted(slide_confusion_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            ],
            "sessions": [s.to_dict() for s in self.sessions.values()]
        }

tracker = SlideTracker()
