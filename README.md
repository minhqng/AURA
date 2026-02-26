# AURA

NCKH: Tiện ích mở rộng (middleware) dùng AI chuyển đổi nội dung web, hỗ trợ người khiếm thị tiếp cận thông tin.

## 🚀 Tính năng

- **Tương phản cao**: Đảo ngược màu sắc trang web (invert + hue-rotate) với xử lý ngoại lệ cho ảnh/video
- **Phóng chữ**: Điều chỉnh kích thước văn bản từ 80% - 200%
- **AI mô tả ảnh**: Sử dụng Gemini AI để mô tả hình ảnh cho người khiếm thị (tích hợp sẵn)

## Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/VNxMinh/AURA.git
cd AURA
```

### 2. Cấu hình API Key (tùy chọn - chỉ nếu dùng AI)

```bash
# Copy file cấu hình mẫu
cp src/config.example.js src/config.js

# Chỉnh sửa src/config.js và thay YOUR_API_KEY_HERE bằng API key từ:
# https://aistudio.google.com/app/apikey
```

### 3. Load extension vào Chrome/Edge

1. Mở `chrome://extensions/` (hoặc `edge://extensions/`)
2. Bật **Developer mode** (góc trên bên phải)
3. Click **Load unpacked**
4. Chọn thư mục `AURA`

## Sử dụng

1. Click vào icon extension trên thanh công cụ trình duyệt
2. Bật/tắt **Tương phản cao** bằng toggle switch
3. Kéo slider **Phóng chữ** để điều chỉnh kích thước văn bản
4. Các thay đổi được áp dụng ngay lập tức và lưu tự động

## Cấu trúc dự án

```
AURA/
├── manifest.json          # Cấu hình extension
├── icons/                 # Icon extension (16, 48, 128px)
├── src/
│   ├── config.js         # API key configuration (gitignored)
│   ├── config.example.js # Template cấu hình
│   ├── background/
│   │   └── background.js # Service worker (AI features)
│   ├── content/
│   │   └── cs_ui.js     # Content script (contrast + font)
│   └── popup/
│       ├── popup.html   # Giao diện popup
│       ├── popup.css    # Style popup
│       ├── popup.js     # Logic popup
│       └── engine.css   # CSS rules cho accessibility
```

## Kỹ thuật

- **Manifest V3**: Chrome Extension phiên bản mới nhất
- **Content Script**: Inject vào tất cả trang web để áp dụng accessibility
- **Storage API**: Đồng bộ cài đặt người dùng qua các tab
- **Gemini AI**: Mô tả hình ảnh bằng tiếng Việt
