-- ============================================================
-- Migration 01: Complete Schema for MHShopDB
-- Chạy file này trong SQL Server Management Studio (SSMS)
-- Database: MHShopDB
-- ============================================================

USE MHShopDB;
GO

-- ============================================================
-- 1. Alter Users: Thêm các cột còn thiếu
-- ============================================================
IF COL_LENGTH('Users', 'resetPasswordToken') IS NULL
BEGIN
    ALTER TABLE Users
        ADD resetPasswordToken VARCHAR(255) NULL,
            resetPasswordExpires DATETIME NULL;
    PRINT '[OK] Đã thêm cột resetPasswordToken và resetPasswordExpires vào bảng Users';
END
ELSE
    PRINT '[SKIP] Cột resetPasswordToken đã tồn tại trong Users';
GO

-- Thêm cột createdAt vào Users nếu chưa có (cần thiết cho query ORDER BY createdAt)
IF COL_LENGTH('Users', 'createdAt') IS NULL
BEGIN
    ALTER TABLE Users ADD createdAt DATETIME DEFAULT GETDATE();
    PRINT '[OK] Đã thêm cột createdAt vào bảng Users';
END
ELSE
    PRINT '[SKIP] Cột createdAt đã tồn tại trong Users';
GO

-- ============================================================
-- 2. Alter Orders: Thêm cột phương thức thanh toán
-- ============================================================
IF COL_LENGTH('Orders', 'paymentMethod') IS NULL
BEGIN
    ALTER TABLE Orders
        ADD paymentMethod NVARCHAR(50) NULL,
            transactionId VARCHAR(100) NULL;
    PRINT '[OK] Đã thêm cột paymentMethod và transactionId vào bảng Orders';
END
ELSE
    PRINT '[SKIP] Cột paymentMethod đã tồn tại trong Orders';
GO

-- ============================================================
-- 3. Tạo bảng CartItems (Giỏ hàng)
-- ============================================================
IF OBJECT_ID('CartItems', 'U') IS NULL
BEGIN
    CREATE TABLE CartItems (
        id        INT IDENTITY(1,1) PRIMARY KEY,
        userId    INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
        productId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Products(id) ON DELETE CASCADE,
        quantity  INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
        createdAt DATETIME DEFAULT GETDATE()
    );
    PRINT '[OK] Đã tạo bảng CartItems';
END
ELSE
    PRINT '[SKIP] Bảng CartItems đã tồn tại';
GO

-- ============================================================
-- 4. Tạo bảng WishlistItems (Yêu thích)
-- ============================================================
IF OBJECT_ID('WishlistItems', 'U') IS NULL
BEGIN
    CREATE TABLE WishlistItems (
        id        INT IDENTITY(1,1) PRIMARY KEY,
        userId    INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
        productId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Products(id) ON DELETE CASCADE,
        createdAt DATETIME DEFAULT GETDATE(),
        CONSTRAINT UQ_Wishlist UNIQUE (userId, productId)
    );
    PRINT '[OK] Đã tạo bảng WishlistItems';
END
ELSE
    PRINT '[SKIP] Bảng WishlistItems đã tồn tại';
GO

-- ============================================================
-- 5. Tạo bảng Reviews (Đánh giá sản phẩm)
-- ============================================================
IF OBJECT_ID('Reviews', 'U') IS NULL
BEGIN
    CREATE TABLE Reviews (
        id        INT IDENTITY(1,1) PRIMARY KEY,
        userId    INT NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE NO ACTION,
        productId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Products(id) ON DELETE CASCADE,
        rating    INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment   NVARCHAR(1000),
        createdAt DATETIME DEFAULT GETDATE()
    );
    PRINT '[OK] Đã tạo bảng Reviews';
END
ELSE
    PRINT '[SKIP] Bảng Reviews đã tồn tại';
GO

-- ============================================================
-- 6. Tạo bảng ProductImages (Ảnh sản phẩm đa chiều)
-- ============================================================
IF OBJECT_ID('ProductImages', 'U') IS NULL
BEGIN
    CREATE TABLE ProductImages (
        id        INT IDENTITY(1,1) PRIMARY KEY,
        productId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Products(id) ON DELETE CASCADE,
        imageUrl  VARCHAR(500) NOT NULL,
        isPrimary BIT DEFAULT 0
    );
    PRINT '[OK] Đã tạo bảng ProductImages';
END
ELSE
    PRINT '[SKIP] Bảng ProductImages đã tồn tại';
GO

-- ============================================================
-- Kiểm tra kết quả
-- ============================================================
PRINT '============================================================';
PRINT 'Migration 01 hoàn tất!';
PRINT 'Danh sách bảng hiện có:';
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME;
