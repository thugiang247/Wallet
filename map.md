# Tấm Bản Đồ Ứng Dụng Quản Lý Chi Tiêu Thông Minh

## Giới thiệu
Ứng dụng "Quản Lý Chi Tiêu Thông Minh" là một công cụ web giúp người dùng quản lý thu chi cá nhân. Ứng dụng này nổi bật với khả năng phân tích giao dịch bằng ngôn ngữ tự nhiên thông qua tích hợp AI (Poe hoặc OpenRouter), lưu trữ dữ liệu cục bộ bằng IndexedDB, và cung cấp giao diện người dùng trực quan để theo dõi tổng quan chi tiêu, lịch sử giao dịch và phân tích theo hạng mục.

## Cấu trúc thư mục

Ứng dụng được tổ chức thành các file chính sau:

*   `index.html`: Cấu trúc giao diện người dùng chính của ứng dụng.
*   `style.css`: Định nghĩa phong cách và giao diện cho ứng dụng, bao gồm cả các biến CSS để hỗ trợ chủ đề sáng/tối.
*   `js/`: Thư mục chứa tất cả các file JavaScript module.
    *   `js/ai.js`: Xử lý logic tích hợp và tương tác với các nhà cung cấp AI.
    *   `js/data.js`: Xử lý các chức năng liên quan đến xuất và nhập dữ liệu.
    *   `js/db.js`: Chứa các hàm để tương tác với IndexedDB, quản lý lưu trữ dữ liệu cục bộ.
    *   `js/events.js`: Tập trung các trình nghe sự kiện (event listeners) cho các tương tác người dùng.
    *   `js/main.js`: Điểm khởi chạy chính của ứng dụng, chịu trách nhiệm khởi tạo và thiết lập ban đầu.
    *   `js/settings.js`: Quản lý logic liên quan đến cài đặt ứng dụng, đặc biệt là cài đặt AI.
    *   `js/state.js`: Định nghĩa và quản lý trạng thái toàn cục của ứng dụng (biến `settings`, `transactions`, `categoryIcons`).
    *   `js/theme.js`: Chứa các hàm để thay đổi và áp dụng chủ đề (sáng/tối) cho ứng dụng.
    *   `js/ui.js`: Chịu trách nhiệm cập nhật giao diện người dùng dựa trên trạng thái ứng dụng.
    *   `js/utils.js`: Cung cấp các hàm tiện ích chung như định dạng tiền tệ, ngày tháng và hiển thị thông báo.
*   `thongtin.txt`: (Lưu ý: File này có nội dung trùng lặp với `index.html`, có thể là bản sao hoặc file không dùng đến).

## Chi tiết các file JavaScript và hàm

### js/ai.js
*   `analyzeWithAI(text)`: Hàm chính để phân tích văn bản nhập vào bằng AI, chọn giữa Poe hoặc OpenRouter dựa trên cài đặt.
*   `analyzeWithPoe(text)`: Gửi yêu cầu phân tích văn bản đến Poe AI thông qua `window.Poe.sendUserMessage()`.
*   `analyzeWithOpenRouter(text)`: Gửi yêu cầu phân tích văn bản đến OpenRouter AI API.

### js/data.js
*   `exportData()`: Xuất dữ liệu giao dịch và cài đặt hiện tại ra file JSON.
*   `handleImportFile(event)`: Xử lý sự kiện nhập file JSON, đọc dữ liệu và cập nhật vào IndexedDB và trạng thái ứng dụng.

### js/db.js
*   `initDB()`: Khởi tạo IndexedDB, tạo các object store `transactions` và `settings` nếu chưa có.
*   `saveToIndexedDB(storeName, data)`: Lưu một đối tượng vào IndexedDB.
*   `getFromIndexedDB(storeName, key)`: Lấy một đối tượng từ IndexedDB bằng khóa.
*   `getAllFromIndexedDB(storeName)`: Lấy tất cả các đối tượng từ một object store trong IndexedDB.

### js/events.js
*   `setupEventListeners()`: Đăng ký tất cả các trình nghe sự kiện cho các phần tử UI như nút "Phân tích với AI", chuyển đổi chủ đề, cài đặt, xuất/nhập dữ liệu.

### js/main.js
*   `init()`: Hàm khởi tạo chính, gọi `initDB()`, `loadSettings()`, `loadTransactions()`, `setupEventListeners()`, `updateUI()` và `applyTheme()` khi ứng dụng khởi động.

### js/settings.js
*   `openSettings()`: Hiển thị modal cài đặt và tải các giá trị cài đặt hiện tại vào form.
*   `saveSettingsFromModal()`: Lưu các cài đặt từ modal vào trạng thái ứng dụng và IndexedDB.
*   `testOpenRouterKey()`: Kiểm tra API key OpenRouter và tải danh sách các model có sẵn.

### js/state.js
*   `settings`: Đối tượng toàn cục lưu trữ các cài đặt của ứng dụng (provider AI, bot Poe, OpenRouter key/model, theme).
*   `categoryIcons`: Đối tượng ánh xạ các hạng mục chi tiêu với biểu tượng tương ứng.

### js/theme.js
*   `toggleTheme()`: Chuyển đổi giữa chủ đề sáng và tối.
*   `applyTheme()`: Áp dụng chủ đề đã lưu hoặc chủ đề hệ thống khi khởi động.
*   `saveSettings()`: (Được gọi nội bộ từ `toggleTheme()` và `applyTheme()`) lưu cài đặt chủ đề vào IndexedDB.

### js/ui.js
*   `addTransaction(transaction)`: Thêm một giao dịch mới vào IndexedDB và cập nhật UI.
*   `loadTransactions()`: Tải tất cả giao dịch từ IndexedDB và cập nhật vào biến trạng thái `transactions`.
*   `updateUI()`: Hàm tổng quát để cập nhật tất cả các phần của giao diện người dùng (thống kê, danh sách giao dịch, lưới hạng mục).
*   `updateStats()`: Cập nhật các thống kê tổng thu, tổng chi và số dư.
*   `updateTransactionsList()`: Cập nhật danh sách các giao dịch trên UI.
*   `updateCategoriesGrid()`: Cập nhật lưới hiển thị chi tiêu theo hạng mục.

### js/utils.js
*   `formatCurrency(amount)`: Định dạng số tiền thành chuỗi tiền tệ VND.
*   `formatDate(dateStr)`: Định dạng chuỗi ngày thành định dạng ngày giờ tiếng Việt.
*   `showSuccess(message)`: Hiển thị thông báo thành công trên UI.
*   `showError(message)`: Hiển thị thông báo lỗi trên UI.

## Các lưu ý khi phát triển/sửa chữa/thêm tính năng mới

1.  **Cấu trúc mô-đun:** Ứng dụng tuân thủ nguyên tắc mô-đun hóa, mỗi file JavaScript có một trách nhiệm cụ thể. Khi thêm tính năng mới, hãy cố gắng đặt logic vào file phù hợp hoặc tạo một file mới nếu chức năng đủ lớn.
2.  **Quản lý trạng thái:** Trạng thái ứng dụng được quản lý tập trung trong `js/state.js`. Khi cần truy cập hoặc thay đổi dữ liệu như `transactions` hoặc `settings`, hãy sử dụng các hàm được cung cấp hoặc cập nhật biến trạng thái một cách cẩn thận để đảm bảo tính nhất quán.
3.  **Lưu trữ dữ liệu:** Dữ liệu giao dịch và cài đặt được lưu trữ cục bộ bằng IndexedDB thông qua `js/db.js`. Mọi thao tác đọc/ghi dữ liệu đều nên thông qua các hàm trong `db.js`.
4.  **Cập nhật giao diện:** Sau khi thay đổi dữ liệu, hãy gọi `updateUI()` từ `js/ui.js` để đảm bảo giao diện được làm mới và hiển thị thông tin chính xác.
5.  **Tích hợp AI:** Ứng dụng hỗ trợ cả Poe AI và OpenRouter. Khi sửa đổi hoặc thêm nhà cung cấp AI mới, cần cập nhật logic trong `js/ai.js` và `js/settings.js` để xử lý các API và cài đặt tương ứng.
6.  **Chủ đề:** Hệ thống chủ đề (sáng/tối) được quản lý trong `js/theme.js` và `style.css` thông qua các biến CSS. Đảm bảo mọi thành phần UI mới đều tương thích với cả hai chủ đề.
7.  **Xử lý lỗi và thông báo:** Sử dụng `showSuccess()` và `showError()` từ `js/utils.js` để hiển thị các thông báo phản hồi cho người dùng một cách nhất quán.
8.  **File `thongtin.txt`:** Kiểm tra lại mục đích của file này. Nếu không cần thiết, nó nên được loại bỏ để tránh nhầm lẫn.