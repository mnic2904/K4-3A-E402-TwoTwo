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
  | Ứng viên | Bao nhiêu người gặp (từ evidence) | Tần suất | Mỗi lần tốn gì | Khả thi (build nổi không) | Chọn? |
  |---|---|---|---|---|---|
  | **D1: Lớp học mô phỏng đa tác tử (Multi-agent)** | 96.7% (30/31 người) thấy thiếu tương tác | Mỗi lần tự ôn tập bài mới | Động lực học giảm, chán nản vì học một mình | Có (Giao diện React + FastAPI gọi LLM) | **Chọn** |
  | **D2: Tóm tắt bài giảng tự động** | 58.1% (18/31 người) thấy slide quá dài | 1-2 lần/bài giảng | 15-20 phút đọc lướt để tìm ý chính | Có (Prompt tóm tắt đơn giản) | Loại |
  | **D3: Chatbot giải đáp thuật ngữ 1-1** | 51.6% (16/31 người) thấy tutor khó hiểu | 3-4 lần/bài học | 5-10 phút để tra Google hoặc tua lại video | Có (Chatbot RAG cơ bản) | Loại |
- Ứng viên ĐÃ LOẠI + vì sao:
  - **D2 (Tóm tắt bài giảng tự động):** Dù giải quyết được vấn đề slide dài (58.1% gặp), nhưng tính năng này biến học viên thành người học thụ động, làm giảm khả năng đào sâu suy nghĩ, hoàn toàn không giải quyết được pain point lớn nhất là thiếu tương tác (96.7%).
  - **D3 (Chatbot giải đáp 1-1):** Chỉ giải quyết được nhu cầu hỏi-đáp một chiều. Việc chat 1-1 với máy dễ gây nhàm chán như cách học hiện tại và không tạo ra được không khí thảo luận đa chiều để kích thích tư duy phản biện.
- Ứng viên CHỌN + vì sao (bằng số):
  - **D1 (Lớp học mô phỏng đa tác tử):** Được chọn vì giải quyết triệt để nỗi đau lớn nhất: **96.7%** (30/31 người) học viên muốn tăng tính tương tác. Thay vì học thụ động, việc đưa vào 2 persona (Bạn học gợi mở + Trợ giảng chuẩn xác) giúp học viên lấy lại hứng thú, tăng khả năng tiếp thu và tiết kiệm hàng giờ đồng hồ loay hoay tự học một mình.

## §3. Giải pháp tương tự đã nghiên cứu
- **[ChatGPT / Custom GPTs]**: 
  - *Flow*: Học viên đặt câu hỏi, AI trả lời trực tiếp 1-1.
  - *Đáng học*: Tốc độ phản hồi nhanh, giao diện chat quen thuộc, dễ dùng.
  - *Đáng né*: Thường đưa thẳng đáp án, thiếu tính chủ động gợi mở, giao tiếp 1 chiều dễ gây nhàm chán và cô đơn.
  - *Mình khác gì*: Hệ thống của mình có đa tác tử (Bạn học + Trợ giảng), tạo ra môi trường tương tác nhiều chiều (có tranh luận, có gợi ý, có chốt kiến thức) giống một lớp học thật.
- **[Khanmigo / Quizlet Q-Chat]**: 
  - *Flow*: AI đóng vai gia sư Socratic, liên tục hỏi gợi mở để học viên tự tìm đáp án.
  - *Đáng học*: Áp dụng phương pháp sư phạm tốt, không đưa đáp án ngay lập tức.
  - *Đáng né*: Chỉ có 1 tác tử là gia sư, việc liên tục bị hỏi vặn vẹo dễ tạo cảm giác bị khảo bài/chấm điểm, gây áp lực cho học viên.
  - *Mình khác gì*: Có thêm "Bạn học ảo" ngây ngô để làm vùng đệm, giúp giảm bớt áp lực. Học viên đôi khi đóng vai trò "người dạy lại" cho bạn học, giúp quá trình ôn tập tự nhiên và thú vị hơn.

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
  | **G1 — Làm rõ hệ thống làm được gì** | Khai báo rõ trên giao diện (thông qua UI/avatar và lời chào đầu tiên) rằng Trợ giảng và Bạn học là các Agent ảo. |
  | **G10 — Thu hẹp phạm vi khi nghi ngờ** | Khi câu hỏi nằm ngoài tài liệu khóa học, Trợ giảng ảo sẽ thừa nhận "không có thông tin" và điều hướng học viên quay lại trọng tâm bài giảng, thay vì bịa câu trả lời. |
  | **G8 — Gạt bỏ dễ dàng** | Học viên có thể dễ dàng bỏ qua gợi ý/câu hỏi của Bạn học ảo, hoặc tiếp tục quy trình học mà không bị ép buộc phải trả lời mọi tin nhắn. |
  | **G9 — Sửa dễ dàng** | Học viên có thể trực tiếp sửa lỗi hoặc phản biện lại câu trả lời "ngây ngô" của Bạn học ảo thông qua giao diện chat để điều chỉnh luồng thảo luận. |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8)
| Tình huống cụ thể | Lớp lỗi | Hành vi mong muốn (Hệ thống làm gì tiếp?) | Nguyên tắc áp dụng |
|---|---|---|---|
| **1.** Học viên hỏi một chi tiết chuyên môn nâng cao không hề có trong slide/transcript bài học. | ① Nguồn sự thật | Trợ giảng ảo trả lời "Không có thông tin trong bài" thay vì tự bịa ra kiến thức ngoài. | G10 |
| **2.** Trợ giảng ảo giải thích đúng kiến thức nhưng trích dẫn sai số trang/đoạn trong tài liệu. | ① Nguồn sự thật | Cung cấp giao diện để học viên dễ dàng bỏ qua hoặc report. | G8, G9 |
| **3.** Học viên chat một câu cụt lủn "Không hiểu" hoặc "Tại sao?". | ② Mơ hồ | Bạn học ảo hoặc Trợ giảng hỏi ngược lại để làm rõ: "Cậu đang vướng mắc ở phần định nghĩa hay phần ví dụ thế?". | G10 |
| **4.** Học viên giải thích cho Bạn học ảo nhưng dùng từ lóng, viết tắt, khiến Agent không hiểu ý. | ② Mơ hồ | Bạn học ảo tỏ ra ngây ngô: "Chỗ này cậu nói rõ hơn được không, mình chưa hiểu ý cậu lắm" để buộc học viên diễn đạt lại. | G8 |
| **5.** Học viên yêu cầu Trợ giảng: "Hãy giải bài tập chương 3 cho tôi để tôi chép". | ③ Ngoài phạm vi | Trợ giảng ảo từ chối khéo léo, nhắc nhở nhiệm vụ là hỗ trợ hiểu bài và chỉ gợi ý hướng tư duy hoặc bước làm đầu tiên. | G1 |
| **6.** Học viên hỏi về thông tin hành chính: "Bao giờ thi? / Điểm danh ở đâu?". | ③ Ngoài phạm vi | Trợ giảng báo rõ "Tôi chỉ hỗ trợ kiến thức học thuật" và điều hướng học viên liên hệ giảng viên/LMS. | G1, G10 |
| **7.** Bạn học ảo đưa ra 1 cách hiểu sai rất thuyết phục, học viên hùa theo tin luôn mà không phản biện. | ④ Đặc thù | **Nguy hiểm:** Trợ giảng ảo phải ngay lập tức can thiệp, ngắt luồng và chỉ ra chỗ sai của cả 2 để học viên không bị hổng kiến thức. | PAIR An toàn |
| **8.** Học viên giải thích đúng ý, nhưng dùng từ ngữ khác thuật ngữ trong slide, khiến Trợ giảng đánh giá sai. | ④ Đặc thù | Học viên có thể trực tiếp chat phản biện lại "Ý tôi là giống hệt thuật ngữ X" để nắn lại hệ thống đánh giá. | G9 |

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
