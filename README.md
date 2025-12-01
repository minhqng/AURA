# AURA

NCKH: Tiện ích mở rộng (middleware) dùng AI chuyển đổi nội dung web, hỗ trợ người khiếm thị tiếp cận thông tin.

## 🚀 Tính năng

- **Tương phản cao**: Đảo ngược màu sắc trang web (invert + hue-rotate) với xử lý ngoại lệ cho ảnh/video
- **Phóng chữ**: Điều chỉnh kích thước văn bản từ 80% - 200%
- **AI mô tả ảnh**: Sử dụng Gemini AI để mô tả hình ảnh cho người khiếm thị (tích hợp sẵn)

## 📦 Cài đặt

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

## 🎯 Sử dụng

1. Click vào icon extension trên thanh công cụ trình duyệt
2. Bật/tắt **Tương phản cao** bằng toggle switch
3. Kéo slider **Phóng chữ** để điều chỉnh kích thước văn bản
4. Các thay đổi được áp dụng ngay lập tức và lưu tự động

## 🏗️ Cấu trúc dự án

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

## 🔧 Kỹ thuật

- **Manifest V3**: Chrome Extension phiên bản mới nhất
- **Content Script**: Inject vào tất cả trang web để áp dụng accessibility
- **Storage API**: Đồng bộ cài đặt người dùng qua các tab
- **Gemini AI**: Mô tả hình ảnh bằng tiếng Việt
- **TTS API**: Text-to-speech cho người khiếm thị

## 📝 Development

### Content Script Logic (cs_ui.js)

- Lắng nghe message `TOGGLE_CONTRAST`: Apply/remove filter `invert(1) hue-rotate(180deg)` lên `<html>`
- Xử lý ngoại lệ: Re-invert ảnh/video để giữ màu gốc
- Lắng nghe message `CHANGE_FONT_SIZE`: Thay đổi `body.style.fontSize` hoặc fallback sang `zoom`
- Tự động load cài đặt từ `chrome.storage` khi tải trang

### Popup Logic (popup.js)

- Lưu cài đặt vào `chrome.storage.sync` (đồng bộ đa thiết bị)
- Gửi message đến content script của tab hiện tại
- Xử lý lỗi gracefully (ignore các tab không inject được)

## 🤝 Đóng góp

1. Fork repo
2. Tạo branch tính năng: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'Add some AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết

## 👥 Tác giả

- **VNxMinh** - [GitHub](https://github.com/VNxMinh)

## 🙏 Lời cảm ơn

- Google Gemini AI cho tính năng mô tả ảnh
- Cộng đồng accessibility cho phản hồi và đề xuất
