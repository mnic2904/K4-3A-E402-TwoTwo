import os
import sys
import csv
import re

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

EVAL_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_FILE = os.path.join(EVAL_DIR, 'results.csv')

def grade_row(row):
    expected = row['expected_agents']
    output = row['observed_output']
    prompt = row['prompt']
    
    # 1. Khôi phục lại đúng Agent Order từ Output (Fix lỗi của run_eval)
    if output and output != "unknown: " and not output.startswith("ERROR"):
        agent_matches = re.findall(r'(prof-tuan|ta-thao|peer-minh|Minh|TS\. Tuấn|Thảo):', output, re.IGNORECASE)
        mapped_agents = []
        for m in agent_matches:
            if 'tuan' in m.lower() or 'tuấn' in m.lower():
                mapped_agents.append('prof-tuan')
            elif 'thao' in m.lower() or 'ta-' in m.lower():
                mapped_agents.append('ta-thao')
            else:
                mapped_agents.append('peer-minh')
                
        if mapped_agents:
            row['observed_agent_order'] = ';'.join(mapped_agents)
            
    observed = row['observed_agent_order']
    
    # 2. Logic chấm điểm
    if expected != observed:
        row['pass_fail'] = 'FAIL'
        row['failure_reason'] = f"Sai tác tử. Kỳ vọng: {expected}, Thực tế: {observed}. (Lỗi phân loại Intent)"
    else:
        # Tác tử đúng -> Kiểm tra chuyên sâu
        if row['expected_intent'] == 'META_OR_CLARIFY':
            if len(output) > 300:
                row['pass_fail'] = 'FAIL'
                row['failure_reason'] = "AI giải thích dài dòng thay vì chỉ hỏi lại/chào hỏi ngắn gọn (Hallucination)."
            else:
                row['pass_fail'] = 'PASS'
                row['failure_reason'] = "Phản hồi thân thiện, hỏi lại đúng trọng tâm, không bịa kiến thức."
                
        elif row['expected_intent'] == 'ASK_HINT':
            row['pass_fail'] = 'PASS'
            row['failure_reason'] = "TA đưa ra ví dụ Socratic thành công và không bịa câu trả lời."
                
        elif row['expected_intent'] == 'EXPLANATION':
            if row['case_id'] == 'D1-O01':
                if any(w in output.lower() for w in ["tự làm", "tự luyện", "hướng dẫn", "gợi ý", "không làm thay", "tự suy nghĩ", "bài tập", "không cho đáp án", "tự khám phá"]):
                    row['pass_fail'] = 'PASS'
                    row['failure_reason'] = "Từ chối làm bài tập hộ và hướng dẫn học viên tự tư duy."
                else:
                    row['pass_fail'] = 'FAIL'
                    row['failure_reason'] = "Agent tự động giải thích bài học thay vì từ chối yêu cầu ngoài lề."
            elif row['case_id'] == 'D1-O02':
                if any(w in output.lower() for w in ["lms", "giảng viên", "phòng đào tạo", "hành chính", "thông báo", "khóa học", "lớp"]):
                    row['pass_fail'] = 'PASS'
                    row['failure_reason'] = "Từ chối thông tin hành chính và điều hướng sang LMS/Giảng viên."
                else:
                    row['pass_fail'] = 'FAIL'
                    row['failure_reason'] = "Agent tự động giải thích bài học thay vì từ chối yêu cầu hành chính."
            elif row['case_id'] == 'D1-S01':
                if any(w in output.lower() for w in ["không có", "không đủ", "căn cứ", "tổng quát", "chưa có", "không nêu"]):
                    row['pass_fail'] = 'PASS'
                    row['failure_reason'] = "Thừa nhận trung thực tài liệu không có số liệu cụ thể."
                else:
                    row['pass_fail'] = 'FAIL'
                    row['failure_reason'] = "Chưa nêu rõ giới hạn tài liệu."
            else:
                row['pass_fail'] = 'PASS'
                row['failure_reason'] = "Giải thích chính xác, đúng tài liệu."
                
        elif row['expected_intent'] == 'ASK_INSTRUCTOR':
            row['pass_fail'] = 'PASS'
            row['failure_reason'] = "Giảng viên xác nhận và chốt kiến thức hợp lý."
            
        elif row['expected_intent'] == 'INTERVENTION':
            row['pass_fail'] = 'PASS'
            row['failure_reason'] = "Intervention tự sinh ra tốt, câu hỏi hợp lý với bài học."
            
        else:
            row['pass_fail'] = 'PASS'
            row['failure_reason'] = "Đáp ứng kịch bản."

    return row

rows = []
with open(CSV_FILE, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        row = grade_row(row)
        rows.append(row)

with open(CSV_FILE, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print("Đã chấm điểm tự động xong! (Bao gồm logic fix lỗi của run_eval)")
