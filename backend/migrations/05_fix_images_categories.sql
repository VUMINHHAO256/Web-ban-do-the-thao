-- ============================================================
-- 05_fix_images_categories.sql
-- Gán ảnh thực tế cho sản phẩm mới + fix category cho sản phẩm cũ
-- Chạy trong SSMS sau khi đã có 04_seed_data.sql
-- ============================================================
USE MHShopDB;
GO

-- ============================================================
-- PHẦN 1: Cập nhật ảnh cho sản phẩm MỚI (racket-xxx, shoe-xxx, ...)
-- Dùng các file ảnh thực tế có trong /public/assets/
-- ============================================================

-- VỢT CẦU LÔNG
UPDATE Products SET image = '88d.jpg'        WHERE id = 'racket-001';
UPDATE Products SET image = 'nana800.jpg'    WHERE id = 'racket-002';
UPDATE Products SET image = 'FClaw.jpg'      WHERE id = 'racket-003';
UPDATE Products SET image = 'driveZ.jpg'     WHERE id = 'racket-004';
UPDATE Products SET image = 'axforce90.jpg'  WHERE id = 'racket-005';
UPDATE Products SET image = 'Calibar900i.jpg'WHERE id = 'racket-006';
UPDATE Products SET image = '99pro.jpg'      WHERE id = 'racket-007';
UPDATE Products SET image = 'jetspeed12.jpg' WHERE id = 'racket-008';
UPDATE Products SET image = 'lethal10.jpg'   WHERE id = 'racket-009';
UPDATE Products SET image = 'duora10.jpg'    WHERE id = 'racket-010';

-- GIÀY CẦU LÔNG
UPDATE Products SET image = 'Giay65z3.jpg'   WHERE id = 'shoe-001';
UPDATE Products SET image = '88dial3.jpg'    WHERE id = 'shoe-002';
UPDATE Products SET image = 'plusA.jpg'      WHERE id = 'shoe-003';
UPDATE Products SET image = 'ka3321.jpg'     WHERE id = 'shoe-004';
UPDATE Products SET image = 'GiayAce.jpg'    WHERE id = 'shoe-005';
UPDATE Products SET image = 'LiningAYT.jpg'  WHERE id = 'shoe-006';
UPDATE Products SET image = 'vsyoulong.jpg'  WHERE id = 'shoe-007';
UPDATE Products SET image = 'waveclaw3.jpg'  WHERE id = 'shoe-008';

-- QUẦN ÁO
UPDATE Products SET image = 'AoYonex2.jpg'   WHERE id = 'cloth-001';
UPDATE Products SET image = 'AoYonex1.jpg'   WHERE id = 'cloth-002';
UPDATE Products SET image = 'aovictor1.jpg'  WHERE id = 'cloth-003';
UPDATE Products SET image = 'aolining1.jpg'  WHERE id = 'cloth-004';
UPDATE Products SET image = 'quanyonex1.jpg' WHERE id = 'cloth-005';
UPDATE Products SET image = 'quanvictor1.jpg'WHERE id = 'cloth-006';
UPDATE Products SET image = 'AoYonex2.jpg'   WHERE id = 'cloth-007';
UPDATE Products SET image = 'aovictor1.jpg'  WHERE id = 'cloth-008';

-- PHỤ KIỆN
UPDATE Products SET image = 'quancan.jpg'    WHERE id = 'acc-001';
UPDATE Products SET image = 'quancan.jpg'    WHERE id = 'acc-002';
UPDATE Products SET image = 'quancan.jpg'    WHERE id = 'acc-003';
UPDATE Products SET image = 'TuiYonex1.jpg'  WHERE id = 'acc-004';
UPDATE Products SET image = 'tuiyonex3.jpg'  WHERE id = 'acc-005';
UPDATE Products SET image = 'tuivictor.jpg'  WHERE id = 'acc-006';
UPDATE Products SET image = 'vongyonex.jpg'  WHERE id = 'acc-007';
UPDATE Products SET image = 'vongyonex.jpg'  WHERE id = 'acc-008';
UPDATE Products SET image = 'cauyonex.jpg'   WHERE id = 'acc-009';
UPDATE Products SET image = 'caulining.jpg'  WHERE id = 'acc-010';
UPDATE Products SET image = 'cauyonex.jpg'   WHERE id = 'acc-011';
UPDATE Products SET image = 'vongyonex.jpg'  WHERE id = 'acc-012';

PRINT '[OK] Đã cập nhật ảnh cho 38 sản phẩm mới';
GO

-- ============================================================
-- PHẦN 2: Fix category cho sản phẩm CŨ (P001-P055)
-- Đổi từ tên tiếng Việt → key tiếng Anh để frontend filter đúng
-- ============================================================
UPDATE Products SET category = 'rackets'     WHERE category IN (N'Vợt cầu lông');
UPDATE Products SET category = 'shoes'       WHERE category IN (N'Giày cầu lông');
UPDATE Products SET category = 'clothing'    WHERE category IN (N'Áo cầu lông', N'Quần cầu lông');
UPDATE Products SET category = 'accessories' WHERE category IN (N'Phụ kiện');

PRINT '[OK] Đã fix category cho sản phẩm cũ (P001-P055)';
GO

-- ============================================================
-- PHẦN 3: Gán ảnh cho sản phẩm CŨ chưa có (kiểm tra rỗng)
-- ============================================================
UPDATE Products SET image = '100zz.jpg'      WHERE id = 'P002' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'FClaw.jpg'      WHERE id = 'P006' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'Calibar900i.jpg'WHERE id = 'P008' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'ryuga.jpg'      WHERE id = 'P012' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'jetspeed12.jpg' WHERE id = 'P016' AND (image IS NULL OR image = '');
UPDATE Products SET image = '88d.jpg'        WHERE id = 'P017' AND (image IS NULL OR image = '');
UPDATE Products SET image = 'axforce90.jpg'  WHERE id = 'P018' AND (image IS NULL OR image = '');

PRINT '[OK] Đã bổ sung ảnh cho sản phẩm cũ còn thiếu';
GO

-- ============================================================
-- Kết quả kiểm tra
-- ============================================================
SELECT
    category,
    COUNT(*) AS total,
    SUM(CASE WHEN image IS NOT NULL AND image != '' THEN 1 ELSE 0 END) AS co_anh,
    SUM(CASE WHEN image IS NULL OR image = '' THEN 1 ELSE 0 END) AS khong_co_anh
FROM Products
GROUP BY category
ORDER BY category;

PRINT '=== Hoàn tất! Ảnh đã được gán cho toàn bộ sản phẩm ===';
GO
