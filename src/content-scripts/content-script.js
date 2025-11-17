console.log("Bắt đầu");
function isImageMissingAlt(img) {
  // 1. Kiểm tra alt thiếu
  if (!img.hasAttribute('alt')) {
    return true; 
  }

  // Lấy giá trị alt và xóa khoảng trắng thừa
  const altText = img.alt ? img.alt.trim() : '';

  // 2. Kiểm tra alt rỗng
  if (altText === '') {
    return true; 
  }
  
  // Chuẩn hóa về chữ thường để kiểm tra đuôi file
  const lowerAlt = altText.toLowerCase();

  // 3. Kiểm tra alt vô nghĩa
  if (lowerAlt.endsWith('.png') || 
      lowerAlt.endsWith('.jpg') || 
      lowerAlt.endsWith('.jpeg') || 
      lowerAlt.endsWith('.gif') || 
      lowerAlt.endsWith('.webp')) {
    return true;
  }

  //-> Ảnh hợp lệ
  return false;
}

function getMockDescription(img) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`[Mô tả giả] Một bức ảnh tại: ${img.src.substring(0, 20)}...`);
    }, 1000);
  });
}

/**
 * @returns {Array} Danh sách các thẻ img bị lỗi.
 */
function scanImages() {
  console.log(`ĐANG QUÉT TẠI: ${window.location.href}`);
  // 1. Lấy toàn bộ ảnh
  const allImages = document.querySelectorAll('img');
  
  // 2. Lọc ảnh lỗi
  const missingAltImages = Array.from(allImages).filter(isImageMissingAlt);
  
  // 3. Console.log các ảnh thiếu alt
  console.log(`Tổng số ảnh: ${allImages.length}`);
  console.log(`Số ảnh lỗi cần xử lý: ${missingAltImages.length}`);
  
  if (missingAltImages.length > 0) {
    console.group("Danh sách chi tiết ảnh lỗi:");
    missingAltImages.forEach((img, index) => {
      console.log(`#${index + 1}:`, img.src, "| Alt hiện tại:", img.getAttribute('alt'));
    });
    console.groupEnd();
  } else {
    console.log("Không tìm thấy ảnh nào lỗi alt.");
  }

  return missingAltImages;
}


async function runMockInjector(imagesToProcess) {
  if (imagesToProcess.length === 0) return;

  console.log("---MockInjector---");

  for (const img of imagesToProcess) {
    try {
      // Gọi hàm giả lập
      const mockDesc = await getMockDescription(img);
      
      // Chèn vào ảnh
      img.alt = mockDesc;
      
      // Đánh dấu ảnh lỗi
      img.style.border = "5px solid red"; 
      
      console.log("Đã chèn:", mockDesc);
    } catch (e) {
      console.error(e);
    }
  }
}

const listErrors = scanImages();

runMockInjector(listErrors);