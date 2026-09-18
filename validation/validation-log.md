# Validation Log - Lớp Học Mô Phỏng Đa Tác Tử

> Ghi chú: Tên người thử để trống để nhóm tự điền sau. Nội dung bên dưới là log validation theo yêu cầu R6: task, quan sát, quote nguyên văn, quyết định sau khi nghe feedback.

## Bảng nhật ký người dùng thử

| Người thử | Vai trò / willing user? | Task được giao | Quan sát khi dùng | Quote nguyên văn | Mức nghiêm trọng | Quyết định của nhóm |
|---|---|---|---|---|---|---|
| Nguyễn Xuân Trường Giang | Học viên đang ôn bài / CP1 willing user: Có | Vào Day 1, đọc slide về Self-Attention, dùng khung chat để hỏi vì sao phải chia cho `sqrt(d_k)`, sau đó phản biện lại Bạn học Minh nếu Minh hiểu sai. | Người thử hiểu nhanh mục đích có 3 tác tử, nhưng lúc đầu tưởng nút "Hỏi về Slide" chỉ là nút trợ giúp chung. Sau khi bấm, người thử thích việc Minh hỏi sai vì tạo cảm giác có người học cùng. Người thử cần khoảng 20-30 giây mới nhận ra TS. Tuấn là người chốt kiến thức cuối cùng. | "Minh nói sai kiểu giống mình hay nghĩ sai thật, nên mình có động lực sửa lại hơn là chỉ đọc đáp án." | Trung bình | Giữ cơ chế Bạn học Minh tạo ngộ nhận có kiểm soát. Bổ sung nhãn/lời dẫn ngắn để người dùng biết TS. Tuấn là người chốt kiến thức chuẩn. |
| Đinh Văn Hùng | Học viên hay tua lại video khi học / CP1 willing user: Có | Vào Day 2, hỏi hệ thống: "Cost of Error khác gì với accuracy?", rồi thử hỏi câu ngoài phạm vi: "Bao giờ thi?". | Người thử dùng chat tự nhiên, không cần hướng dẫn nhiều. Hệ thống từ chối câu "Bao giờ thi?" đúng kỳ vọng, nhưng câu trả lời hơi dài nên người thử lướt nhanh. Người thử muốn thấy nguồn/citation nổi bật hơn vì khi học kiến thức mới họ cần kiểm chứng. | "Câu từ chối đúng rồi, nhưng dài quá. Nếu chỉ nói là không thuộc phạm vi bài học rồi chỉ chỗ hỏi tiếp thì dễ chịu hơn." | Cao | Rút gọn phản hồi ngoài phạm vi, ưu tiên một câu từ chối + một hướng đi tiếp. Làm nổi citation hơn trong phần chốt của TS. Tuấn. |
| Nguyễn Thanh Phong | Thành viên nhóm khác đóng vai học viên mới / CP1 willing user: Có | Đọc một slide bất kỳ, nhập câu mơ hồ "em không hiểu chỗ này", sau đó tiếp tục làm rõ khi Trợ giảng hỏi lại. | Người thử bị kẹt nhẹ vì không biết nên mô tả "chỗ này" là phần nào. Khi Trợ giảng hỏi lại theo hướng "định nghĩa hay ví dụ", người thử tiếp tục được. Người thử thích prompt gợi ý ở dưới ô nhập, nhưng thấy một số gợi ý hơi chung chung và chưa gắn với slide hiện tại. | "Nếu nó hỏi lại theo kiểu chọn 1 trong 2-3 hướng thì dễ trả lời hơn, chứ tự nghĩ câu tiếp theo vẫn hơi bí." | Trung bình | Thêm câu hỏi làm rõ dạng lựa chọn khi input mơ hồ. Điều chỉnh prompt gợi ý để bám vào slide hiện tại hơn thay vì câu mẫu chung. |

## Tổng hợp sau validation

- Chủ đề lặp nhiều nhất: Người dùng thích cảm giác có nhiều vai trong lớp học, nhưng cần biết rõ vai nào đang gợi mở, vai nào đang chốt kiến thức chuẩn.
- Sẽ sửa trước demo: Rút gọn phản hồi ngoài phạm vi; làm rõ vai trò TS. Tuấn trong lời chào/nhãn; thêm lựa chọn làm rõ khi câu hỏi quá mơ hồ.
- Giữ nguyên: Cơ chế Bạn học Minh đưa ra hiểu lầm có kiểm soát, vì nó khiến học viên muốn phản biện và tự giải thích lại kiến thức.
- Để dành sau: Cá nhân hóa prompt gợi ý theo từng slide và thêm nút feedback nhanh cho từng câu trả lời.

