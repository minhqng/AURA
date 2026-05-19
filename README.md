# AURA

NCKH: Tiện ích mở rộng (middleware) dùng AI chuyển đổi nội dung web, hỗ trợ người khiếm thị tiếp cận thông tin.

## Tính năng

### Chế độ Tương phản

- **Tương phản cao** — nền đen, chữ vàng (`#ffff00`) để tăng độ tương phản tối đa
- **Đảo ngược màu** — `invert(100%) hue-rotate(180deg)` với tự động re-invert ảnh/video
- **Thang xám** — `grayscale(100%)` cho người nhạy cảm với màu sắc

### Điều chỉnh Phông chữ

- **Phóng chữ** — kéo slider từ 80% đến 200%
- **Font family, line-height, letter-spacing** — tùy chỉnh qua CSS variables (`--user-font-family`, `--user-line-height`, `--user-letter-spacing`)

### AI & Đọc màn hình

- **AI mô tả ảnh** — Gemini 1.5 Flash tự động quét ảnh thiếu `alt`, sinh mô tả tiếng Việt
- **Text-to-Speech** — đọc văn bản bằng giọng tiếng Việt (`vi-VN`) qua Chrome TTS API

## Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/minhqng/AURA.git
cd AURA
```

### 2. Cấu hình API Key (tùy chọn — chỉ cần nếu dùng tính năng AI)

```bash
# Copy file cấu hình mẫu
cp src/config.example.js src/config.js

# Chỉnh sửa src/config.js và thay YOUR_API_KEY_HERE bằng API key từ:
# https://aistudio.google.com/app/apikey
```

### 3. Load extension vào Chrome / Edge

1. Mở `chrome://extensions/` (hoặc `edge://extensions/`)
2. Bật **Developer mode** (góc trên bên phải)
3. Click **Load unpacked**
4. Chọn thư mục gốc `AURA` (chứa `manifest.json`)

## Sử dụng

1. Click vào icon extension trên thanh công cụ trình duyệt
2. Bật/tắt **Tương phản cao** bằng toggle switch
3. Kéo slider **Phóng chữ** để điều chỉnh kích thước văn bản
4. Các thay đổi được áp dụng ngay lập tức, đồng bộ qua các tab và lưu tự động
5. Ảnh thiếu `alt` sẽ được AI quét tự động — viền vàng (đang xử lý), xanh (thành công), đỏ (lỗi)

## Cấu trúc dự án

```
AURA/
├── manifest.json              # Cấu hình extension (Manifest V3)
├── icons/                     # Icon extension (16, 48, 128 px)
├── docs/                      # Tài liệu dự án
├── figma/                     # Thiết kế UI (HTML preview + assets)
├── src/
│   ├── config.example.js      # Template cấu hình API key
│   ├── config.js              # API key thực tế (gitignored)
│   ├── background/
│   │   └── background.js      # Service worker — AI image description & TTS
│   ├── content/
│   │   └── cs_ui.js           # Content script — contrast filter & font size
│   ├── content-scripts/
│   │   └── content-script.js  # Content script — auto-scan ảnh thiếu alt
│   └── popup/
│       ├── popup.html         # Giao diện popup
│       ├── popup.css          # Style popup
│       ├── popup.js           # Logic popup (save settings & notify tabs)
│       ├── engine.css         # CSS rules accessibility (contrast, font vars)
│       └── content/
│           └── content.js     # Content script — áp dụng CSS variables & styles
```

## Kỹ thuật

- **Manifest V3** — Chrome Extension API phiên bản mới nhất
- **Content Scripts** — inject vào tất cả trang web (`<all_urls>`) để áp dụng accessibility
- **Storage API** — `chrome.storage.sync` đồng bộ cài đặt người dùng qua các thiết bị
- **Gemini 1.5 Flash** — mô tả hình ảnh bằng tiếng Việt qua REST API
- **Chrome TTS API** — đọc văn bản với giọng `vi-VN`
- **MutationObserver** — phát hiện ảnh lazy-load để quét AI tự động
- **CSS Variables** — điều khiển font-size, font-family, line-height, letter-spacing qua `data-a11y-*` attributes
