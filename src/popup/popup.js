document.addEventListener("DOMContentLoaded", function () {
  // Lấy các element từ DOM
  const contrastRadios = document.querySelectorAll('input[name="contrast"]');
  const fontSlider = document.getElementById("font-slider");
  const fontSizeValue = document.getElementById("font-size-value");

  // --- 1. TẢI CÀI ĐẶT ĐÃ LƯU KHI MỞ POPUP ---
  // Chúng ta sẽ lấy giá trị từ 'storage' và cập nhật UI
  chrome.storage.sync.get(["contrastMode", "fontSize"], (result) => {
    // 1.1. Cập nhật chế độ tương phản
    if (result.contrastMode) {
      document.querySelector(
        `input[name="contrast"][value="${result.contrastMode}"]`
      ).checked = true;
    }
    document.addEventListener("DOMContentLoaded", function () {
      // Lấy các element tương tác
      const contrastToggle = document.getElementById("contrast-toggle");
      const fontSlider = document.getElementById("font-slider");
      const fontSizeValue = document.getElementById("font-size-value");
      const previewText = document.getElementById("preview-text");

      // --- 1. TẢI CÀI ĐẶT ĐÃ LƯU KHI MỞ POPUP ---
      // Chúng ta dùng giá trị mặc định (false, 100) nếu chưa có gì
      chrome.storage.sync.get(
        { isContrastOn: false, fontSize: 100 },
        (result) => {
          // 1.1. Cập nhật Toggle
          contrastToggle.checked = result.isContrastOn;

          // 1.2. Cập nhật thanh trượt Font
          fontSlider.value = result.fontSize;

          // 1.3. Cập nhật Text hiển thị % và Text xem trước
          updateFontDisplay(result.fontSize);
        }
      );

      // --- 2. XỬ LÝ SỰ KIỆN (TASK 3) ---

      // 2.1. Lắng nghe sự kiện "change" trên Toggle
      contrastToggle.addEventListener("change", () => {
        saveSettings(); // Lưu khi thay đổi (Task 4)
      });

      // 2.2. Lắng nghe sự kiện "input" trên thanh trượt (để update real-time)
      fontSlider.addEventListener("input", () => {
        const newSize = fontSlider.value;
        updateFontDisplay(newSize);
        saveSettings(); // Lưu khi thay đổi (Task 4)
      });

      // --- HÀM HỖ TRỢ ---

      // Hàm cập nhật text hiển thị % và text xem trước
      function updateFontDisplay(size) {
        fontSizeValue.textContent = `${size}%`;
        previewText.style.fontSize = `${size}%`;
      }

      // Hàm LƯU CÀI ĐẶT (TASK 4)
      function saveSettings() {
        const isContrastOn = contrastToggle.checked;
        const fontSize = fontSlider.value;

        chrome.storage.sync.set({
          isContrastOn: isContrastOn,
          fontSize: fontSize,
        });

        // (Ghi chú cho project) Bước tiếp theo là gửi tin nhắn
        // tới content script để áp dụng thay đổi ngay lập tức.
      }
    });

    // 1.2. Cập nhật kích thước font
    if (result.fontSize) {
      fontSlider.value = result.fontSize;
      fontSizeValue.textContent = `${result.fontSize}%`;
    }
  });

  // --- 2. XỬ LÝ SỰ KIỆN VÀ LƯU THAY ĐỔI (TASK 3 & 4) ---

  // 2.1. Lắng nghe thay đổi trên các radio button
  contrastRadios.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      saveSettings();
    });
  });

  // 2.2. Lắng nghe thay đổi trên thanh trượt (sự kiện 'input' để cập nhật real-time)
  fontSlider.addEventListener("input", (event) => {
    // Cập nhật text hiển thị %
    fontSizeValue.textContent = `${event.target.value}%`;
    saveSettings();
  });

  // Hàm để lưu tất cả cài đặt (Task 4)
  function saveSettings() {
    const selectedContrast = document.querySelector(
      'input[name="contrast"]:checked'
    ).value;
    const selectedFontSize = fontSlider.value;

    chrome.storage.sync.set({
      contrastMode: selectedContrast,
      fontSize: selectedFontSize,
    });

    // (Ghi chú cho project) Ở bước tiếp theo, chúng ta sẽ gửi
    // một message tới content script từ đây để áp dụng thay đổi ngay lập tức.
  }
});
