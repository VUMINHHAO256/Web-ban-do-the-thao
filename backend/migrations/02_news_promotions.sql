-- ============================================================
-- Migration 02: Thêm bảng News và Promotions
-- Chạy trong SQL Server Management Studio (SSMS)
-- Database: MHShopDB
-- ============================================================

USE MHShopDB;
GO

-- ============================================================
-- 1. Tạo bảng News (Tin tức / Blog)
-- ============================================================
IF OBJECT_ID('News', 'U') IS NULL
BEGIN
    CREATE TABLE News (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        slug        VARCHAR(300) UNIQUE NOT NULL,
        title       NVARCHAR(500) NOT NULL,
        excerpt     NVARCHAR(1000) NULL,
        content     NVARCHAR(MAX) NULL,
        category    NVARCHAR(100) NULL,
        author      NVARCHAR(100) NULL DEFAULT N'MHShop',
        emoji       VARCHAR(10) NULL DEFAULT '📰',
        bgColor     VARCHAR(20) NULL DEFAULT '#1e3a5f',
        readTime    INT NOT NULL DEFAULT 5,
        isHot       BIT NOT NULL DEFAULT 0,
        isPublished BIT NOT NULL DEFAULT 1,
        createdAt   DATETIME NOT NULL DEFAULT GETDATE(),
        updatedAt   DATETIME NOT NULL DEFAULT GETDATE()
    );
    PRINT '[OK] Đã tạo bảng News';
END
ELSE
    PRINT '[SKIP] Bảng News đã tồn tại';
GO

-- ============================================================
-- 2. Tạo bảng Promotions (Mã giảm giá / Khuyến mãi)
-- ============================================================
IF OBJECT_ID('Promotions', 'U') IS NULL
BEGIN
    CREATE TABLE Promotions (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        code            VARCHAR(50) UNIQUE NOT NULL,
        discount        NVARCHAR(100) NOT NULL,
        description     NVARCHAR(500) NULL,
        minOrderAmount  INT NOT NULL DEFAULT 0,
        discountType    VARCHAR(20) NOT NULL DEFAULT 'percent',  -- 'percent' | 'fixed' | 'freeship'
        discountValue   INT NOT NULL DEFAULT 0,
        isActive        BIT NOT NULL DEFAULT 1,
        expiresAt       DATETIME NULL,
        createdAt       DATETIME NOT NULL DEFAULT GETDATE()
    );
    PRINT '[OK] Đã tạo bảng Promotions';
END
ELSE
    PRINT '[SKIP] Bảng Promotions đã tồn tại';
GO

-- ============================================================
-- 3. Seed dữ liệu mẫu cho News
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM News WHERE slug = 'cach-chon-vot-cau-long-phu-hop')
BEGIN
    INSERT INTO News (slug, title, excerpt, content, category, author, emoji, bgColor, readTime, isHot)
    VALUES
    ('cach-chon-vot-cau-long-phu-hop',
     N'Hướng Dẫn Chọn Vợt Cầu Lông Phù Hợp Với Trình Độ',
     N'Việc chọn vợt cầu lông không chỉ dựa vào thương hiệu mà còn phụ thuộc vào trình độ, phong cách chơi và ngân sách. Bài viết này giúp bạn tìm được chiếc vợt ưng ý nhất.',
     N'<p>Chọn vợt cầu lông phù hợp là bước đầu tiên quan trọng để cải thiện kỹ năng chơi. Hãy xem xét các yếu tố sau:</p><h2>1. Trọng lượng vợt</h2><p>Vợt nhẹ (80-85g) phù hợp cho người mới và phong cách phòng thủ. Vợt nặng hơn (86-95g) cho smash mạnh.</p><h2>2. Độ cứng thân</h2><p>Thân cứng cho độ kiểm soát tốt; thân mềm cho lực đánh từ cổ tay.</p><h2>3. Điểm cân bằng</h2><p>Đầu nặng: smash mạnh. Đầu nhẹ: phòng thủ nhanh. Cân bằng: đa năng.</p>',
     N'Hướng dẫn', N'MHShop Expert', '🏸', '#1e3a5f', 5, 1),

    ('top-5-giay-yonex-2026',
     N'Top 5 Giày Cầu Lông Yonex Được Ưa Chuộng Nhất Năm 2026',
     N'Yonex vẫn là thương hiệu giày cầu lông đỉnh cao. Cùng điểm qua 5 mẫu giày được vận động viên chuyên nghiệp và người chơi phong trào yêu thích nhất năm 2026.',
     N'<p>Yonex luôn dẫn đầu về công nghệ giày cầu lông. Dưới đây là 5 mẫu hot nhất 2026:</p><ol><li><strong>Power Cushion 65Z3</strong> – Nhẹ, đệm tốt, dành cho tấn công</li><li><strong>Aerus Z2</strong> – Siêu nhẹ, phù hợp đơn nam tốc độ cao</li><li><strong>SHB-65X3</strong> – Bền, đa năng, giá tốt</li><li><strong>Power Cushion Eclipsion Z3</strong> – Đệm cao cấp nhất</li><li><strong>SHB-02LCX</strong> – Phù hợp đôi nam/hỗn hợp</li></ol>',
     N'Review sản phẩm', N'Admin MHShop', '👟', '#9a3412', 7, 0),

    ('ky-thuat-co-ban-cho-nguoi-moi',
     N'Kỹ Thuật Đánh Cầu Lông Cơ Bản Cho Người Mới Bắt Đầu',
     N'Bạn mới bắt đầu chơi cầu lông và không biết bắt đầu từ đâu? Phần hướng dẫn này đưa bạn qua từng bước cơ bản.',
     N'<p>Cầu lông là môn thể thao dễ học nhưng khó thành thạo. Hãy nắm vững những kỹ thuật cơ bản này:</p><h2>1. Cách cầm vợt</h2><p>Grip cơ bản: V-grip (tay cái và ngón trỏ tạo hình chữ V trên thân vợt).</p><h2>2. Tư thế đứng</h2><p>Hai chân rộng bằng vai, gối hơi cong, trọng tâm thấp và di chuyển linh hoạt.</p><h2>3. Các cú đánh cơ bản</h2><p>Clear, Drop shot, Smash và Net shot là 4 cú đánh căn bản nhất.</p>',
     N'Kỹ thuật', N'Coach Minh', '🎯', '#15803d', 8, 0),

    ('bao-quan-vot-dung-cach',
     N'Cách Bảo Quản Vợt Cầu Lông Đúng Cách Để Dùng Bền Lâu',
     N'Vợt cầu lông cần được bảo quản cẩn thận để giữ hiệu suất tốt nhất. Những lưu ý về lưu trữ, vệ sinh và bảo dưỡng giúp vợt luôn trong trạng thái tối ưu.',
     N'<p>Một chiếc vợt được bảo quản tốt có thể dùng hàng năm trời. Hãy làm theo những lưu ý sau:</p><h2>Lưu trữ</h2><p>Luôn cất vợt trong bao/túi chuyên dụng. Tránh để nơi có nhiệt độ cao hoặc ẩm ướt.</p><h2>Vệ sinh</h2><p>Lau khô sau mỗi lần dùng. Không để mồ hôi bám lâu trên grip.</p><h2>Đan lại cước</h2><p>Nên đan lại khi cước bị đứt hoặc 3-6 tháng/lần tùy tần suất chơi.</p>',
     N'Mẹo hay', N'MHShop Expert', '🔧', '#6b21a8', 4, 0),

    ('loi-ich-choi-cau-long-buoi-sang',
     N'Tại Sao Nên Chơi Cầu Lông Buổi Sáng? Lợi Ích Bất Ngờ!',
     N'Chơi cầu lông buổi sáng không chỉ tốt cho sức khỏe thể chất mà còn cải thiện tinh thần, độ tập trung và năng suất làm việc.',
     N'<p>Nhiều nghiên cứu cho thấy tập thể thao buổi sáng mang lại nhiều lợi ích vượt trội:</p><h2>Lợi ích sức khỏe</h2><p>Đốt calories hiệu quả, tăng cường tim mạch, cải thiện sức bền.</p><h2>Lợi ích tinh thần</h2><p>Giải phóng endorphin, giảm stress, tăng tập trung cho cả ngày làm việc.</p><h2>Lợi ích xã hội</h2><p>Xây dựng cộng đồng, tạo thói quen lành mạnh và kết nối bạn bè.</p>',
     N'Sức khỏe', N'BS. Sport', '☀️', '#b45309', 6, 0),

    ('chon-cuoc-vot-phu-hop',
     N'Cách Chọn Cước Vợt Phù Hợp Với Phong Cách Chơi Của Bạn',
     N'Cước vợt ảnh hưởng lớn đến hiệu suất chơi cầu lông. Từ độ căng, vật liệu đến thương hiệu — tất cả đều cần cân nhắc kỹ.',
     N'<p>Cước vợt là yếu tố thường bị bỏ qua nhưng rất quan trọng:</p><h2>Loại cước</h2><p>Cước mỏng (0.61-0.65mm): cảm giác tốt, control. Cước dày (0.68-0.72mm): bền hơn, dành cho smash.</p><h2>Độ căng</h2><p>20-24 lbs: phù hợp người mới. 24-28 lbs: trung cấp. 28+ lbs: chuyên nghiệp.</p><h2>Thương hiệu nổi tiếng</h2><p>Yonex BG65, BG80, Aeroplane 70K, Victor VS850.</p>',
     N'Hướng dẫn', N'Admin MHShop', '🧵', '#0f766e', 5, 0),

    ('giai-cau-long-viet-nam-2026',
     N'Giải Cầu Lông Vô Địch Quốc Gia 2026 — Kết Quả & Highlights',
     N'Giải Cầu Lông Vô Địch Quốc Gia 2026 vừa khép lại với nhiều bất ngờ thú vị. Điểm lại những trận đấu đáng nhớ nhất.',
     N'<p>Giải đấu năm nay đã mang lại nhiều khoảnh khắc đáng nhớ:</p><h2>Kết quả chung cuộc</h2><p>Đơn Nam: Nguyễn Tiến Minh giành ngôi vô địch lần thứ 15. Đơn Nữ: Vũ Thị Trang chiếm ưu thế áp đảo.</p><h2>Highlights đáng nhớ</h2><p>Trận bán kết đơn nam kéo dài 3 set với hơn 80 phút thi đấu căng thẳng.</p>',
     N'Tin thể thao', N'Sport Reporter', '🏆', '#dc2626', 6, 1),

    ('victor-thruster-k-pro-2026',
     N'Victor Ra Mắt Vợt Thruster K Pro 2026 — Đột Phá Công Nghệ!',
     N'Victor vừa giới thiệu dòng vợt Thruster K Pro 2026 với công nghệ carbon nano tiên tiến nhất. Chiếc vợt mới hứa hẹn smash mạnh mẽ và kiểm soát hoàn hảo.',
     N'<p>Victor Thruster K Pro 2026 là bước tiến vượt bậc trong công nghệ vợt:</p><h2>Công nghệ mới</h2><p>Carbon Nano Technology giảm trọng lượng 15% so với thế hệ trước trong khi tăng độ cứng.</p><h2>Thông số kỹ thuật</h2><p>Trọng lượng: 83g (4U). Độ căng tối đa: 32 lbs. Chiều dài: 675mm.</p><h2>Giá dự kiến</h2><p>Khoảng 3.5 - 4.2 triệu đồng tại MHShop.</p>',
     N'Tin sản phẩm', N'MHShop Expert', '🆕', '#1d4ed8', 4, 0),

    ('su-khac-biet-giua-cac-thuong-hieu',
     N'Yonex vs Victor vs Li-Ning: Chọn Thương Hiệu Nào Cho Bạn?',
     N'Ba thương hiệu cầu lông hàng đầu châu Á với công nghệ và triết lý thiết kế khác nhau. Phân tích chi tiết ưu nhược điểm để bạn đưa ra lựa chọn phù hợp nhất.',
     N'<p>Mỗi thương hiệu có điểm mạnh riêng:</p><h2>Yonex (Nhật Bản)</h2><p>Công nghệ đỉnh cao, vật liệu tốt nhất, giá cao. Phù hợp người chơi nghiêm túc.</p><h2>Victor (Đài Loan)</h2><p>Chất lượng/giá tốt, đa dạng model. Tài trợ nhiều giải đấu châu Á.</p><h2>Li-Ning (Trung Quốc)</h2><p>Thiết kế hiện đại, phong cách thời trang. Được nhiều VĐV Trung Quốc dùng.</p>',
     N'So sánh', N'MHShop Expert', '⚖️', '#374151', 9, 0);

    PRINT '[OK] Đã seed 9 bài viết vào bảng News';
END
ELSE
    PRINT '[SKIP] Dữ liệu News đã tồn tại';
GO

-- ============================================================
-- 4. Seed dữ liệu mẫu cho Promotions
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Promotions WHERE code = 'BADMINTON10')
BEGIN
    INSERT INTO Promotions (code, discount, description, minOrderAmount, discountType, discountValue, isActive, expiresAt)
    VALUES
    ('BADMINTON10', N'Giảm 10%', N'Áp dụng cho toàn bộ đơn hàng', 500000,  'percent', 10,  1, DATEADD(month, 3, GETDATE())),
    ('YONEX20',     N'Giảm 20%', N'Chỉ dành cho sản phẩm Yonex',   1000000, 'percent', 20,  1, DATEADD(month, 2, GETDATE())),
    ('FREESHIP',    N'Miễn phí ship', N'Miễn phí vận chuyển toàn quốc', 300000, 'freeship', 0, 1, DATEADD(month, 6, GETDATE())),
    ('NEWUSER15',   N'Giảm 15%', N'Ưu đãi dành cho khách hàng mới', 200000, 'percent', 15, 1, DATEADD(month, 1, GETDATE()));

    PRINT '[OK] Đã seed 4 mã giảm giá vào bảng Promotions';
END
ELSE
    PRINT '[SKIP] Dữ liệu Promotions đã tồn tại';
GO

-- Kiểm tra kết quả
SELECT 'News' AS TableName, COUNT(*) AS Records FROM News
UNION ALL
SELECT 'Promotions', COUNT(*) FROM Promotions;
PRINT 'Migration 02 hoàn tất!';
