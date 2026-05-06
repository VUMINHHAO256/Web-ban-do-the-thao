-- ============================================================
-- Migration 06: Thêm cột brand vào Products + Cập nhật dữ liệu
-- Chạy file này trong SQL Server Management Studio (SSMS)
-- Database: MHShopDB
-- ============================================================

USE MHShopDB;
GO

-- ============================================================
-- Bước 1: Thêm cột brand nếu chưa có
-- ============================================================
IF COL_LENGTH('Products', 'brand') IS NULL
BEGIN
    ALTER TABLE Products ADD brand NVARCHAR(100) NULL;
    PRINT '[OK] Đã thêm cột brand vào bảng Products';
END
ELSE
    PRINT '[SKIP] Cột brand đã tồn tại trong Products';
GO

-- ============================================================
-- Bước 2: Cập nhật brand dựa theo tên sản phẩm
-- ============================================================

-- Yonex
UPDATE Products
SET brand = 'Yonex'
WHERE brand IS NULL
  AND (name LIKE N'%Yonex%' OR id LIKE '%yonex%');

-- Victor
UPDATE Products
SET brand = 'Victor'
WHERE brand IS NULL
  AND (name LIKE N'%Victor%' OR id LIKE '%victor%');

-- Li-Ning
UPDATE Products
SET brand = 'Li-Ning'
WHERE brand IS NULL
  AND (name LIKE N'%Li-Ning%' OR name LIKE N'%Lining%' OR id LIKE '%lining%');

-- Babolat
UPDATE Products
SET brand = 'Babolat'
WHERE brand IS NULL
  AND (name LIKE N'%Babolat%' OR id LIKE '%babolat%');

-- Adidas
UPDATE Products
SET brand = 'Adidas'
WHERE brand IS NULL
  AND (name LIKE N'%Adidas%' OR id LIKE '%adidas%');

-- VS
UPDATE Products
SET brand = 'VS'
WHERE brand IS NULL
  AND (name LIKE N'%VS %' OR name LIKE N'% VS%' OR id LIKE '%vs-%');

-- Kumpoo
UPDATE Products
SET brand = 'Kumpoo'
WHERE brand IS NULL
  AND (name LIKE N'%Kumpoo%' OR id LIKE '%kumpoo%');

-- Asics
UPDATE Products
SET brand = 'Asics'
WHERE brand IS NULL
  AND (name LIKE N'%Asics%' OR id LIKE '%asics%');

-- Mizuno
UPDATE Products
SET brand = 'Mizuno'
WHERE brand IS NULL
  AND (name LIKE N'%Mizuno%' OR id LIKE '%mizuno%');

-- RSL
UPDATE Products
SET brand = 'RSL'
WHERE brand IS NULL
  AND (name LIKE N'%RSL%' OR id LIKE '%rsl%');

PRINT '[OK] Đã cập nhật brand cho tất cả sản phẩm';
GO

-- ============================================================
-- Bước 3: Kiểm tra kết quả
-- ============================================================
SELECT brand, COUNT(*) AS SoLuong
FROM Products
GROUP BY brand
ORDER BY SoLuong DESC;

PRINT '=== Migration 06 hoàn tất! ===';
GO
