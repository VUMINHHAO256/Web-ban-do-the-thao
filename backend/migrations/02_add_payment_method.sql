-- ============================================================
-- Migration 02: Thêm cột paymentMethod vào bảng Orders
-- Chạy file này trong SQL Server Management Studio (SSMS)
-- Database: MHShopDB
-- ============================================================

USE MHShopDB;
GO

-- Thêm cột paymentMethod nếu chưa có
IF COL_LENGTH('Orders', 'paymentMethod') IS NULL
BEGIN
    ALTER TABLE Orders
        ADD paymentMethod NVARCHAR(50) NULL DEFAULT 'cod';
    PRINT '[OK] Da them cot paymentMethod vao bang Orders';
END
ELSE
    PRINT '[SKIP] Cot paymentMethod da ton tai trong Orders';
GO

-- Thêm cột transactionId nếu chưa có
IF COL_LENGTH('Orders', 'transactionId') IS NULL
BEGIN
    ALTER TABLE Orders
        ADD transactionId VARCHAR(100) NULL;
    PRINT '[OK] Da them cot transactionId vao bang Orders';
END
ELSE
    PRINT '[SKIP] Cot transactionId da ton tai trong Orders';
GO

-- Thêm cột note nếu chưa có
IF COL_LENGTH('Orders', 'note') IS NULL
BEGIN
    ALTER TABLE Orders
        ADD note NVARCHAR(500) NULL;
    PRINT '[OK] Da them cot note vao bang Orders';
END
ELSE
    PRINT '[SKIP] Cot note da ton tai trong Orders';
GO

PRINT '============================================================';
PRINT 'Migration 02 hoan tat!';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Orders'
ORDER BY ORDINAL_POSITION;
