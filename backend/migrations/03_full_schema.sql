-- ============================================================
-- MHShopDB - Full Schema + Seed Data
-- Chạy file này trong SSMS để khởi tạo toàn bộ database
-- ============================================================

-- Tạo database (bỏ qua nếu đã có)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'MHShopDB')
BEGIN
    CREATE DATABASE MHShopDB;
    PRINT '[OK] Đã tạo database MHShopDB';
END
GO

USE MHShopDB;
GO

-- ============================================================
-- 1. USERS
-- ============================================================
IF OBJECT_ID('Users','U') IS NULL
BEGIN
    CREATE TABLE Users (
        id                   INT IDENTITY(1,1) PRIMARY KEY,
        firstName            NVARCHAR(50)  NOT NULL,
        lastName             NVARCHAR(50)  NOT NULL,
        email                VARCHAR(100)  UNIQUE NOT NULL,
        phone                VARCHAR(20)   NULL,
        password             VARCHAR(255)  NOT NULL,
        role                 VARCHAR(20)   NOT NULL DEFAULT 'user',
        resetPasswordToken   VARCHAR(255)  NULL,
        resetPasswordExpires DATETIME      NULL,
        createdAt            DATETIME      NOT NULL DEFAULT GETDATE()
    );
    PRINT '[OK] Tạo bảng Users';
END ELSE PRINT '[SKIP] Users đã tồn tại';
GO

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
IF OBJECT_ID('Products','U') IS NULL
BEGIN
    CREATE TABLE Products (
        id          VARCHAR(50)   PRIMARY KEY,
        name        NVARCHAR(255) NOT NULL,
        category    NVARCHAR(100) NULL,
        price       INT           NOT NULL,
        oldPrice    INT           NOT NULL DEFAULT 0,
        image       VARCHAR(500)  NULL,
        stock       INT           NOT NULL DEFAULT 0,
        status      VARCHAR(50)   NOT NULL DEFAULT 'active',
        isFeatured  BIT           NOT NULL DEFAULT 0,
        isNew       BIT           NOT NULL DEFAULT 0,
        description NVARCHAR(MAX) NULL
    );
    PRINT '[OK] Tạo bảng Products';
END ELSE PRINT '[SKIP] Products đã tồn tại';
GO

-- ============================================================
-- 3. ORDERS
-- ============================================================
IF OBJECT_ID('Orders','U') IS NULL
BEGIN
    CREATE TABLE Orders (
        id               INT IDENTITY(1,1) PRIMARY KEY,
        userId           INT           NULL FOREIGN KEY REFERENCES Users(id),
        customerName     NVARCHAR(100) NOT NULL,
        customerPhone    VARCHAR(20)   NOT NULL,
        customerAddress  NVARCHAR(255) NOT NULL,
        totalAmount      INT           NOT NULL,
        status           VARCHAR(50)   NOT NULL DEFAULT 'pending',
        paymentMethod    NVARCHAR(50)  NULL,
        transactionId    VARCHAR(100)  NULL,
        createdAt        DATETIME      NOT NULL DEFAULT GETDATE()
    );
    PRINT '[OK] Tạo bảng Orders';
END ELSE PRINT '[SKIP] Orders đã tồn tại';
GO

-- ============================================================
-- 4. ORDER ITEMS
-- ============================================================
IF OBJECT_ID('OrderItems','U') IS NULL
BEGIN
    CREATE TABLE OrderItems (
        id        INT IDENTITY(1,1) PRIMARY KEY,
        orderId   INT         NOT NULL FOREIGN KEY REFERENCES Orders(id) ON DELETE CASCADE,
        productId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Products(id),
        quantity  INT         NOT NULL,
        price     INT         NOT NULL
    );
    PRINT '[OK] Tạo bảng OrderItems';
END ELSE PRINT '[SKIP] OrderItems đã tồn tại';
GO

-- ============================================================
-- 5. CART ITEMS
-- ============================================================
IF OBJECT_ID('CartItems','U') IS NULL
BEGIN
    CREATE TABLE CartItems (
        id        INT IDENTITY(1,1) PRIMARY KEY,
        userId    INT         NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
        productId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Products(id) ON DELETE CASCADE,
        quantity  INT         NOT NULL DEFAULT 1 CHECK (quantity > 0),
        createdAt DATETIME    NOT NULL DEFAULT GETDATE()
    );
    PRINT '[OK] Tạo bảng CartItems';
END ELSE PRINT '[SKIP] CartItems đã tồn tại';
GO

-- ============================================================
-- 6. WISHLIST ITEMS
-- ============================================================
IF OBJECT_ID('WishlistItems','U') IS NULL
BEGIN
    CREATE TABLE WishlistItems (
        id        INT IDENTITY(1,1) PRIMARY KEY,
        userId    INT         NOT NULL FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
        productId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Products(id) ON DELETE CASCADE,
        createdAt DATETIME    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT UQ_Wishlist UNIQUE (userId, productId)
    );
    PRINT '[OK] Tạo bảng WishlistItems';
END ELSE PRINT '[SKIP] WishlistItems đã tồn tại';
GO

-- ============================================================
-- 7. REVIEWS
-- ============================================================
IF OBJECT_ID('Reviews','U') IS NULL
BEGIN
    CREATE TABLE Reviews (
        id        INT IDENTITY(1,1) PRIMARY KEY,
        userId    INT         NOT NULL FOREIGN KEY REFERENCES Users(id),
        productId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Products(id) ON DELETE CASCADE,
        rating    INT         NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment   NVARCHAR(1000) NULL,
        createdAt DATETIME    NOT NULL DEFAULT GETDATE()
    );
    PRINT '[OK] Tạo bảng Reviews';
END ELSE PRINT '[SKIP] Reviews đã tồn tại';
GO

-- ============================================================
-- 8. PRODUCT IMAGES
-- ============================================================
IF OBJECT_ID('ProductImages','U') IS NULL
BEGIN
    CREATE TABLE ProductImages (
        id        INT IDENTITY(1,1) PRIMARY KEY,
        productId VARCHAR(50)  NOT NULL FOREIGN KEY REFERENCES Products(id) ON DELETE CASCADE,
        imageUrl  VARCHAR(500) NOT NULL,
        isPrimary BIT          NOT NULL DEFAULT 0
    );
    PRINT '[OK] Tạo bảng ProductImages';
END ELSE PRINT '[SKIP] ProductImages đã tồn tại';
GO

-- ============================================================
-- 9. NOTIFICATIONS
-- ============================================================
IF OBJECT_ID('Notifications','U') IS NULL
BEGIN
    CREATE TABLE Notifications (
        id        INT IDENTITY(1,1) PRIMARY KEY,
        type      VARCHAR(50)    NOT NULL,
        message   NVARCHAR(500)  NOT NULL,
        data      NVARCHAR(MAX)  NULL,
        isRead    BIT            NOT NULL DEFAULT 0,
        createdAt DATETIME       NOT NULL DEFAULT GETDATE()
    );
    PRINT '[OK] Tạo bảng Notifications';
END ELSE PRINT '[SKIP] Notifications đã tồn tại';
GO

-- ============================================================
-- 10. SETTINGS
-- ============================================================
IF OBJECT_ID('Settings','U') IS NULL
BEGIN
    CREATE TABLE Settings (
        [key]       VARCHAR(100)   PRIMARY KEY,
        value       NVARCHAR(MAX)  NOT NULL,
        description NVARCHAR(255)  NOT NULL DEFAULT ''
    );
    PRINT '[OK] Tạo bảng Settings';
END ELSE PRINT '[SKIP] Settings đã tồn tại';
GO

-- ============================================================
-- 11. NEWS
-- ============================================================
IF OBJECT_ID('News','U') IS NULL
BEGIN
    CREATE TABLE News (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        slug        VARCHAR(300)   UNIQUE NOT NULL,
        title       NVARCHAR(500)  NOT NULL,
        excerpt     NVARCHAR(1000) NULL,
        content     NVARCHAR(MAX)  NULL,
        category    NVARCHAR(100)  NULL,
        author      NVARCHAR(100)  NULL DEFAULT N'MHShop',
        emoji       VARCHAR(10)    NULL DEFAULT '?',
        bgColor     VARCHAR(20)    NULL DEFAULT '#1e3a5f',
        readTime    INT            NOT NULL DEFAULT 5,
        isHot       BIT            NOT NULL DEFAULT 0,
        isPublished BIT            NOT NULL DEFAULT 1,
        createdAt   DATETIME       NOT NULL DEFAULT GETDATE(),
        updatedAt   DATETIME       NOT NULL DEFAULT GETDATE()
    );
    PRINT '[OK] Tạo bảng News';
END ELSE PRINT '[SKIP] News đã tồn tại';
GO

-- ============================================================
-- 12. PROMOTIONS
-- ============================================================
IF OBJECT_ID('Promotions','U') IS NULL
BEGIN
    CREATE TABLE Promotions (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        code            VARCHAR(50)    UNIQUE NOT NULL,
        discount        NVARCHAR(100)  NOT NULL,
        description     NVARCHAR(500)  NULL,
        minOrderAmount  INT            NOT NULL DEFAULT 0,
        discountType    VARCHAR(20)    NOT NULL DEFAULT 'percent',
        discountValue   INT            NOT NULL DEFAULT 0,
        isActive        BIT            NOT NULL DEFAULT 1,
        expiresAt       DATETIME       NULL,
        createdAt       DATETIME       NOT NULL DEFAULT GETDATE()
    );
    PRINT '[OK] Tạo bảng Promotions';
END ELSE PRINT '[SKIP] Promotions đã tồn tại';
GO

PRINT '=== Schema khởi tạo xong. Chạy file 02_seed_data.sql để thêm dữ liệu mẫu ===';
GO
