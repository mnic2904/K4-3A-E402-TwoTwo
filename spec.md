# Template AI Spec *(spec.md — commit trước hạn chốt spec: 21:00 17/9, tại CP4 · quality bar chốt từ thời điểm nộp)*

> Cấu trúc phủ đúng "SPEC 8 phần" của chương trình: Bằng chứng (§1-§2) · Lát cắt (§4) · Canvas (đính kèm CP1) · Augment/Automate (§4) · 4 đường đi của trải nghiệm (§6) · Kiểu lỗi (§5) · Kiểm thử (§7) · Phân công (§8). Hướng dẫn viết từng mục: `02-guide.md`.

```markdown
# AI SPEC — Lớp Học Mô Phỏng Đa Tác Tử (Track D1) · Nhóm [TwoTwo] · Zone [C4]
Hướng: [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

## §1. User & Job
- Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ): Học viên tự học, muốn ôn tập và hiểu sâu bài giảng thông qua thảo luận.
- Core JTBD (không tên sản phẩm/AI trong câu): Thảo luận và giải đáp thắc mắc về tài liệu học tập để nắm vững kiến thức.
- Problem statement (KHÔNG chữ AI): Học viên thường gặp khó khăn khi tự ôn tập một mình do thiếu người trao đổi, phản biện và hướng dẫn, dẫn đến việc hiểu sai hoặc không sâu kiến thức.
- Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):
  - Số liệu mining / kết quả khảo sát (n = 31, % xác nhận): 51.6% thấy tutor trả lời khó hiểu, 58.1% thấy slide quá dài, 38.7% thấy slide chưa rõ ràng và thiếu sự tương tác. 96.7% người được khảo sát muốn Vlearn có thêm tính tương tác
  - ≥5 quote/ví dụ nguyên văn + nguồn:  
    - “Nhiều khi phải tua video lại nhiều lần để hiểu rõ một vấn đề, web cũng thiếu tính tương tác”
    - “Thiếu tương tác giữa học viên và ứng dụng”
    - “Cách tiếp cận bài giảng yêu cầu học viên phải chủ động nên ko có tính tương tác”
    - “Trong quá trình thảo luận, thỉnh thoảng câu trả lời của gia sư bị đánh giá là khó hiểu hoặc không phù hợp với bối cảnh”
    - “Thích thảo luận và trao đổi với người có kiến thức chuyên môn sâu hơn”

## §2. Impact & quyết định chọn
- Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):
- Ứng viên ĐÃ LOẠI + vì sao:
- Ứng viên CHỌN + vì sao (bằng số):

## §3. Giải pháp tương tự đã nghiên cứu
- [Sản phẩm 1]: flow / đáng học / đáng né / mình khác gì
- [Sản phẩm 2]: ...

## §4. Thiết kế
- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả): Học viên gửi câu hỏi/thảo luận về bài giảng, hệ thống (điều phối Đa Tác Tử) quyết định Trợ giảng ảo hay Bạn học ảo sẽ phản hồi, để tạo ra một cuộc hội thoại đa chiều giúp học viên hiểu bài.
- Non-goals (≥3 thứ KHÔNG build): 
  - Không xây dựng hệ thống quản lý khóa học (LMS).
  - Không thay thế giáo viên hay hệ thống tự động chấm điểm.
  - Không tạo nội dung bài giảng mới (chỉ dùng đoạn văn bài giảng cắt ra làm RAG).
- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [x] Working — phần nào mock, phần nào thật: Thật toàn bộ (Giao diện Chat Frontend React, API Backend Python/FastAPI điều phối LLM, RAG từ text bài giảng).
- Automation: [x] augment [ ] conditional [ ] automate — lý do theo cost-of-error: Trợ lý đóng vai trò đồng hành và hỗ trợ học tập (augment) thay vì tự động hóa toàn bộ, vì quá trình học cần sự chủ động của người học, sai sót của AI có thể được học viên phát hiện và sửa chữa qua hội thoại đa chiều.
- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  |   |   |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

## §6. Bốn đường đi của trải nghiệm
- Happy path: Học viên hỏi, Bạn học ảo đưa ra ý kiến ngây ngô/gợi mở, Trợ giảng ảo chốt lại kiến thức chuẩn xác dựa trên Knowledge base. · Low-confidence (②): Trợ lý hoặc bạn học ảo thông báo không có đủ thông tin trong bài giảng để trả lời. · Failure/không căn cứ (①): AI bịa ra kiến thức ngoài slide. · Correction (user sửa): Học viên đính chính lại thông tin hoặc yêu cầu Trợ giảng giải thích rõ hơn câu trả lời của Bạn học ảo.
- Khi bị đòi ngoài phạm vi (③): Trợ giảng từ chối khéo léo và hướng học viên quay lại chủ đề bài giảng (Knowledge snippet). · Case đặc thù domain (④): 

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được: Tính chính xác so với tài liệu (RAG), Tính phù hợp của vai trò (Persona: Trợ giảng nghiêm túc/chuẩn xác, Bạn học ngây ngô/gợi mở), Khả năng điều phối lượt nói (Turn-taking).
- Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong eval/): Đã chuẩn bị bộ ___ test cases trong `docs/golden-set.csv` (Kịch bản test - Hard tests).
- Quality bar (chốt từ hạn chốt spec của khoá, giữ nguyên sau đó): "Đạt khi ≥ ___% qua bộ, và ___"
- Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):

## §8. Phân công & kế hoạch
- Phân công có tên: spec / evidence / prompt / code / demo
- Willing users (≥2 tên) + kế hoạch vòng validation *(bonus, nếu làm)*:
- Multi-prototype (nếu làm): trục khác biệt của ≥2 phương án + lý do chọn:

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
```
