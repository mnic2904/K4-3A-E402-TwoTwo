import csv
import re

CSV_FILE = 'results.csv'

grades = {
    'D1-S01': ('FAIL', 'Trượt do vẫn còn lỗi ở lượt trước.'),
    'D1-S02': ('PASS', 'Đã chốt citation T01-015 thay vì giữ citation sai, Thầy Tuấn trả lời trước.'),
    'D1-A01': ('FAIL', 'Từ "không hiểu" không khớp với hint_keywords nên bị rơi vào EXPLANATION.'),
    'D1-A02': ('FAIL', 'Câu "Giải thích trang này" bị rơi vào EXPLANATION, agent tự tóm tắt cả trang thay vì hỏi lại.'),
    'D1-A03': ('PASS', 'Minh đã hỏi lại thân thiện, không bịa kiến thức.'),
    'D1-A04': ('FAIL', 'Câu dài 12 ký tự nên không vào casual_words, rơi vào EXPLANATION.'),
    'D1-O01': ('FAIL', 'Rơi vào EXPLANATION nên vẫn giải thích đầy đủ.'),
    'D1-O02': ('FAIL', 'Rơi vào EXPLANATION, tự động giải thích Attention thay vì từ chối câu hỏi hành chính.'),
    'D1-D01': ('FAIL', 'Từ "giúp" trong "xác nhận giúp" làm hệ thống nhầm thành ASK_HINT.'),
    'D1-D02': ('PASS', 'Thầy Tuấn xác nhận và Minh cảm ơn tự nhiên.'),
    'D1-N01': ('PASS', 'Đúng trình tự và có trích dẫn.'),
    'D1-N02': ('PASS', 'Giải thích đúng trọng tâm.'),
    'D1-N03': ('FAIL', 'Từ "ví dụ" làm hệ thống nhầm thành ASK_HINT nên TA nhảy vào trả lời.'),
    'D1-N04': ('FAIL', 'Từ "ví dụ" làm hệ thống nhầm thành ASK_HINT.'),
    'D1-N05': ('PASS', 'Giải thích chính xác Multi-head.'),
    'D1-N06': ('PASS', 'Nêu bật được xử lý song song so với tuần tự.'),
    'D1-N07': ('PASS', 'TA đưa ra gợi ý Socratic thành công.'),
    'D1-N08': ('PASS', 'Thầy Tuấn chốt kiến thức gọn gàng.'),
    'D1-N09': ('PASS', 'Minh chào hỏi tự nhiên, không giải thích dài dòng.'),
    'D1-R01': ('FAIL', 'LLM bị ảnh hưởng bởi Prompt Injection nên tự xưng là ta-thao dù vào luồng ASK_INSTRUCTOR.'),
    'D1-R02': ('PASS', 'Minh không suy diễn ý định chuyên môn cho từ "hả".'),
    'D1-R03': ('PASS', 'Intervention tự sinh ra tốt, câu hỏi hợp lý với bài học.')
}

rows = []
with open(CSV_FILE, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        cid = row['case_id']
        
        # Fix observed_agent_order by parsing the observed_output properly
        output = row['observed_output']
        if output and output != "unknown: " and not output.startswith("ERROR"):
            agents = []
            if 'prof-tuan:' in output:
                agents.append('prof-tuan')
            if 'ta-thao:' in output:
                agents.append('ta-thao')
            if 'peer-minh:' in output:
                # Need to count how many times peer-minh spoke
                count = output.count('peer-minh:')
                for _ in range(count):
                    agents.append('peer-minh')
                    
            # Actually, just parse in order of appearance
            agent_matches = re.findall(r'(prof-tuan|ta-thao|peer-minh|Minh|TS\. Tuấn):', output)
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
                
        if cid in grades:
            row['pass_fail'] = grades[cid][0]
            row['failure_reason'] = grades[cid][1]
            
        rows.append(row)

with open(CSV_FILE, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
