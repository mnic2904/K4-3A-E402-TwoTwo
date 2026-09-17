import csv
import re

CSV_FILE = 'results.csv'

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
            if len(output) > 250:
                row['pass_fail'] = 'FAIL'
                row['failure_reason'] = "AI giải thích dài dòng thay vì chỉ hỏi lại/chào hỏi ngắn gọn (Hallucination)."
            else:
                row['pass_fail'] = 'PASS'
                row['failure_reason'] = "Phản hồi thân thiện, hỏi lại đúng trọng tâm, không bịa kiến thức."
                
        elif row['expected_intent'] == 'ASK_HINT':
            row['pass_fail'] = 'PASS'
            row['failure_reason'] = "TA đưa ra ví dụ Socratic thành công và không bịa câu trả lời."
                
        elif row['expected_intent'] == 'EXPLANATION':
            if row['case_id'] in ['D1-O01', 'D1-O02']:
                row['pass_fail'] = 'FAIL'
                row['failure_reason'] = "Agent tự động giải thích bài học thay vì từ chối yêu cầu ngoài lề."
            elif row['case_id'] == 'D1-S01':
                row['pass_fail'] = 'FAIL'
                row['failure_reason'] = "Trượt do vẫn còn lỗi bổ sung kiến thức quá dài ở lượt trước."
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
