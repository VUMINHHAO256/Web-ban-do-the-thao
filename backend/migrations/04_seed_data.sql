-- ============================================================
-- MHShopDB - Seed Data (Dữ liệu mẫu đầy đủ)
-- Chạy SAU khi đã có schema (03_full_schema.sql hoặc database.sql)
-- ============================================================
USE MHShopDB;
GO

-- ============================================================
-- SETTINGS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Settings WHERE [key]='store_name')
INSERT INTO Settings([key],value,description) VALUES
('store_name',    N'MHShop - Cửa hàng cầu lông chuyên nghiệp', N'Tên cửa hàng'),
('store_email',   'vuminhhao@mhshop.vn',                        N'Email liên hệ'),
('store_phone',   '0327.711.655',                               N'Số điện thoại'),
('store_address', N'Thôn Đỗ Xá, Yên Mỹ, Hưng Yên',            N'Địa chỉ cửa hàng'),
('min_order_amount','100000',                                    N'Đơn tối thiểu miễn ship'),
('maintenance_mode','false',                                     N'Chế độ bảo trì'),
('notifications_enabled','true',                                 N'Bật thông báo đơn hàng');
GO

-- ============================================================
-- ADMIN USER  (password = 'admin123')
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Users WHERE email='admin@mhshop.com')
INSERT INTO Users(firstName,lastName,email,phone,password,role) VALUES
(N'Admin',N'System','admin@mhshop.com','0123456789',
 '$2a$10$wE9q3v.I8T.4nK8P.5m67.U/uW8H3q/Q.F.H1R0Kx1N/1lA/M8oJm','admin');
GO

-- ============================================================
-- PRODUCTS — VỢT CẦU LÔNG
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Products WHERE id='racket-001')
INSERT INTO Products(id,name,category,price,oldPrice,image,stock,status,isFeatured,isNew) VALUES
('racket-001',N'Yonex Astrox 88D Pro',      'rackets',3200000,3800000,'yonex-astrox88d.jpg', 15,1,1,0),
('racket-002',N'Yonex Nanoflare 1000Z',     'rackets',4500000,5200000,'yonex-nf1000z.jpg',   10,1,1,1),
('racket-003',N'Victor Thruster K Pro',      'rackets',2800000,3200000,'victor-tk-pro.jpg',   20,1,1,0),
('racket-004',N'Victor DriveX 10 Metallic', 'rackets',2200000,2600000,'victor-dx10m.jpg',     18,1,0,1),
('racket-005',N'Li-Ning Axforce 90',         'rackets',2600000,3100000,'lining-axforce90.jpg',12,1,1,0),
('racket-006',N'Li-Ning Turbo Charging 75D','rackets',1800000,2200000,'lining-tc75d.jpg',     25,1,0,0),
('racket-007',N'Yonex Astrox 77 Pro',        'rackets',2900000,3400000,'yonex-ax77pro.jpg',   8, 1,0,0),
('racket-008',N'Victor Jetspeed S 12',       'rackets',3400000,3900000,'victor-js12.jpg',     6, 1,1,1),
('racket-009',N'Babolat Satelite Origin',    'rackets',1600000,1900000,'babolat-origin.jpg',  30,1,0,0),
('racket-010',N'Yonex Duora 10',             'rackets',2100000,2500000,'yonex-duora10.jpg',   14,1,0,0);
GO

-- ============================================================
-- PRODUCTS — GIÀY CẦU LÔNG
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Products WHERE id='shoe-001')
INSERT INTO Products(id,name,category,price,oldPrice,image,stock,status,isFeatured,isNew) VALUES
('shoe-001',N'Yonex Power Cushion 65Z3',     'shoes',2200000,2600000,'yonex-65z3.jpg',    20,1,1,0),
('shoe-002',N'Yonex Aerus Z2',               'shoes',2800000,3200000,'yonex-aerusz2.jpg', 15,1,1,1),
('shoe-003',N'Victor P9200III',              'shoes',1900000,2300000,'victor-p9200.jpg',  25,1,0,0),
('shoe-004',N'Victor A960F',                 'shoes',1200000,1500000,'victor-a960f.jpg',  30,1,0,0),
('shoe-005',N'Li-Ning ULTRA IV',             'shoes',1600000,1900000,'lining-ultra4.jpg', 18,1,1,0),
('shoe-006',N'Li-Ning SAGA 3',               'shoes',1400000,1700000,'lining-saga3.jpg',  22,1,0,1),
('shoe-007',N'Adidas Adizero Ubersonic 4',   'shoes',2100000,2500000,'adidas-uber4.jpg',  12,1,0,0),
('shoe-008',N'Asics Gel-Blast FF',           'shoes',1800000,2100000,'asics-gel.jpg',     10,1,0,0);
GO

-- ============================================================
-- PRODUCTS — QUẦN ÁO
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Products WHERE id='cloth-001')
INSERT INTO Products(id,name,category,price,oldPrice,image,stock,status,isFeatured,isNew) VALUES
('cloth-001',N'Áo Yonex Tournament Men',    'clothing',650000, 800000, 'yonex-shirt-m.jpg',  40,1,1,0),
('cloth-002',N'Áo Yonex Tournament Women',  'clothing',650000, 800000, 'yonex-shirt-w.jpg',  35,1,1,0),
('cloth-003',N'Áo Victor T-5003',           'clothing',450000, 560000, 'victor-t5003.jpg',   50,1,0,0),
('cloth-004',N'Áo Li-Ning AAYU001',         'clothing',380000, 480000, 'lining-aayu001.jpg', 60,1,0,1),
('cloth-005',N'Quần Yonex 15152EX',         'clothing',550000, 680000, 'yonex-shorts.jpg',   45,1,1,0),
('cloth-006',N'Quần Victor R-3099',         'clothing',380000, 480000, 'victor-r3099.jpg',   55,1,0,0),
('cloth-007',N'Bộ đồ Yonex Men Set',        'clothing',1100000,1350000,'yonex-set-m.jpg',   20,1,0,1),
('cloth-008',N'Bộ đồ Victor Women Set',     'clothing',950000, 1200000,'victor-set-w.jpg',  18,1,0,0);
GO

-- ============================================================
-- PRODUCTS — PHỤ KIỆN
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Products WHERE id='acc-001')
INSERT INTO Products(id,name,category,price,oldPrice,image,stock,status,isFeatured,isNew) VALUES
('acc-001',N'Cước Yonex BG80',              'accessories',180000,220000,'yonex-bg80.jpg',   100,1,1,0),
('acc-002',N'Cước Yonex BG65',              'accessories',120000,150000,'yonex-bg65.jpg',   150,1,0,0),
('acc-003',N'Cước Victor VS-850',           'accessories',90000, 120000,'victor-vs850.jpg', 120,1,0,0),
('acc-004',N'Túi vợt Yonex Team 6R',        'accessories',650000,780000,'yonex-bag6r.jpg',   30,1,1,0),
('acc-005',N'Balo Yonex 2326EX',            'accessories',1200000,1500000,'yonex-pack.jpg', 20,1,1,1),
('acc-006',N'Túi vợt Victor BR6209',        'accessories',480000,600000,'victor-br6209.jpg', 25,1,0,0),
('acc-007',N'Băng cổ tay Yonex AC102EX',    'accessories',95000, 130000,'yonex-ac102.jpg',  80,1,0,0),
('acc-008',N'Grip Yonex AC102EX',           'accessories',75000,  95000,'yonex-grip.jpg',   200,1,0,0),
('acc-009',N'Cầu lông Yonex AS50',          'accessories',320000,380000,'yonex-as50.jpg',   60,1,1,0),
('acc-010',N'Cầu lông Victor NS3000',        'accessories',180000,220000,'victor-ns3000.jpg',80,1,0,1),
('acc-011',N'Cầu nhựa Yonex Mavis 350',     'accessories',220000,280000,'yonex-mavis.jpg',  50,1,0,0),
('acc-012',N'Đai bảo vệ khuỷu tay Victor',  'accessories',150000,200000,'victor-elbow.jpg', 40,1,0,0);
GO

-- ============================================================
-- PROMOTIONS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Promotions WHERE code='BADMINTON10')
INSERT INTO Promotions(code,discount,description,minOrderAmount,discountType,discountValue,isActive,expiresAt) VALUES
('BADMINTON10',N'Giảm 10%',    N'Áp dụng toàn bộ đơn hàng',       500000, 'percent', 10, 1, DATEADD(month,3,GETDATE())),
('YONEX20',    N'Giảm 20%',    N'Chỉ dành cho sản phẩm Yonex',    1000000,'percent', 20, 1, DATEADD(month,2,GETDATE())),
('FREESHIP',   N'Miễn phí ship',N'Miễn phí vận chuyển toàn quốc',  300000,'freeship', 0, 1, DATEADD(month,6,GETDATE())),
('NEWUSER15',  N'Giảm 15%',    N'Ưu đãi khách hàng mới',           200000,'percent', 15, 1, DATEADD(month,1,GETDATE())),
('VICTOR15',   N'Giảm 15%',    N'Chỉ dành cho sản phẩm Victor',    800000,'percent', 15, 1, DATEADD(month,2,GETDATE())),
('SUMMER25',   N'Giảm 25%',    N'Khuyến mãi hè — đơn từ 2 triệu', 2000000,'percent',25, 1, DATEADD(month,1,GETDATE())),
('SHOE100K',   N'Giảm 100K',   N'Giảm thẳng 100.000đ mua giày',    500000,'amount', 100000,1,DATEADD(month,2,GETDATE()));
GO

-- ============================================================
-- NEWS
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM News WHERE slug='cach-chon-vot-cau-long-phu-hop')
INSERT INTO News(slug,title,excerpt,content,category,author,bgColor,readTime,isHot,isPublished) VALUES

('cach-chon-vot-cau-long-phu-hop',
 N'Hướng Dẫn Chọn Vợt Cầu Lông Phù Hợp Với Trình Độ',
 N'Chọn vợt cầu lông phụ thuộc vào trình độ, phong cách chơi và ngân sách. Bài viết giúp bạn tìm được chiếc vợt ưng ý nhất.',
 N'<p>Xem xét các yếu tố: trọng lượng vợt (80-85g cho người mới), độ cứng thân, điểm cân bằng.</p><h2>Vợt cho người mới</h2><p>Chọn vợt nhẹ, cân bằng, giá từ 500K-1.5M như Yonex Duora hay Victor DriveX.</p><h2>Vợt nâng cao</h2><p>Yonex Astrox 88D, Victor Thruster K — cho smash mạnh, kiểm soát tốt.</p>',
 N'Hướng dẫn',N'MHShop Expert','#1e3a5f',5,1,1),

('top-5-giay-yonex-2026',
 N'Top 5 Giày Cầu Lông Yonex Được Ưa Chuộng Nhất Năm 2026',
 N'Yonex dẫn đầu về công nghệ giày cầu lông. Cùng điểm qua 5 mẫu được yêu thích nhất năm 2026.',
 N'<ol><li><strong>Power Cushion 65Z3</strong> – Nhẹ, đệm tốt, tấn công</li><li><strong>Aerus Z2</strong> – Siêu nhẹ, tốc độ cao</li><li><strong>SHB-65X3</strong> – Bền, đa năng</li><li><strong>Eclipsion Z3</strong> – Đệm cao cấp</li><li><strong>SHB-02LCX</strong> – Đánh đôi</li></ol>',
 N'Review sản phẩm',N'Admin MHShop','#9a3412',7,0,1),

('ky-thuat-co-ban-cho-nguoi-moi',
 N'Kỹ Thuật Đánh Cầu Lông Cơ Bản Cho Người Mới Bắt Đầu',
 N'Bạn mới bắt đầu chơi cầu lông? Phần hướng dẫn này đưa bạn qua từng bước cơ bản từ cầm vợt đến các cú đánh.',
 N'<h2>Cách cầm vợt</h2><p>V-grip: tay cái và ngón trỏ tạo chữ V trên thân vợt.</p><h2>Tư thế đứng</h2><p>Hai chân rộng bằng vai, gối hơi cong.</p><h2>4 cú đánh cơ bản</h2><p>Clear, Drop shot, Smash, Net shot.</p>',
 N'Kỹ thuật',N'Coach Minh','#15803d',8,0,1),

('bao-quan-vot-dung-cach',
 N'Cách Bảo Quản Vợt Cầu Lông Đúng Cách Để Dùng Bền Lâu',
 N'Bảo quản đúng cách giúp vợt giữ hiệu suất tốt nhất và dùng được lâu hơn.',
 N'<h2>Lưu trữ</h2><p>Cất trong bao chuyên dụng, tránh nhiệt độ cao và ẩm ướt.</p><h2>Vệ sinh</h2><p>Lau khô sau mỗi lần dùng, không để mồ hôi bám lâu trên grip.</p><h2>Đan lại cước</h2><p>3-6 tháng/lần tùy tần suất chơi.</p>',
 N'Mẹo hay',N'MHShop Expert','#6b21a8',4,0,1),

('loi-ich-choi-cau-long-buoi-sang',
 N'Tại Sao Nên Chơi Cầu Lông Buổi Sáng? Lợi Ích Bất Ngờ!',
 N'Chơi cầu lông buổi sáng không chỉ tốt cho sức khỏe thể chất mà còn cải thiện tinh thần và năng suất.',
 N'<h2>Lợi ích sức khỏe</h2><p>Đốt calories hiệu quả, tăng cường tim mạch, cải thiện sức bền.</p><h2>Lợi ích tinh thần</h2><p>Giải phóng endorphin, giảm stress, tăng tập trung.</p>',
 N'Sức khỏe',N'BS. Sport','#b45309',6,0,1),

('chon-cuoc-vot-phu-hop',
 N'Cách Chọn Cước Vợt Phù Hợp Với Phong Cách Chơi Của Bạn',
 N'Cước vợt ảnh hưởng lớn đến hiệu suất. Từ độ căng, vật liệu đến thương hiệu đều cần cân nhắc.',
 N'<h2>Loại cước</h2><p>0.61-0.65mm: cảm giác tốt. 0.68-0.72mm: bền hơn cho smash.</p><h2>Độ căng</h2><p>20-24 lbs: người mới. 24-28 lbs: trung cấp. 28+ lbs: chuyên nghiệp.</p><h2>Thương hiệu</h2><p>Yonex BG65, BG80, Victor VS850.</p>',
 N'Hướng dẫn',N'Admin MHShop','#0f766e',5,0,1),

('giai-cau-long-viet-nam-2026',
 N'Giải Cầu Lông Vô Địch Quốc Gia 2026 — Kết Quả & Highlights',
 N'Giải Cầu Lông Vô Địch Quốc Gia 2026 vừa khép lại với nhiều bất ngờ thú vị.',
 N'<h2>Kết quả</h2><p>Đơn Nam: Nguyễn Tiến Minh giành ngôi vô địch lần 15. Đơn Nữ: Vũ Thị Trang.</p><h2>Highlights</h2><p>Trận bán kết đơn nam kéo dài 3 set, hơn 80 phút thi đấu căng thẳng.</p>',
 N'Tin thể thao',N'Sport Reporter','#dc2626',6,1,1),

('victor-thruster-k-pro-2026',
 N'Victor Ra Mắt Vợt Thruster K Pro 2026 — Đột Phá Công Nghệ!',
 N'Victor giới thiệu Thruster K Pro 2026 với công nghệ carbon nano tiên tiến nhất.',
 N'<h2>Công nghệ</h2><p>Carbon Nano Technology giảm trọng lượng 15%, tăng độ cứng.</p><h2>Thông số</h2><p>Trọng lượng: 83g (4U). Độ căng tối đa: 32 lbs. Chiều dài: 675mm.</p>',
 N'Tin sản phẩm',N'MHShop Expert','#1d4ed8',4,0,1),

('su-khac-biet-giua-cac-thuong-hieu',
 N'Yonex vs Victor vs Li-Ning: Chọn Thương Hiệu Nào Cho Bạn?',
 N'Ba thương hiệu hàng đầu châu Á với công nghệ và triết lý khác nhau. Phân tích ưu nhược điểm.',
 N'<h2>Yonex (Nhật)</h2><p>Công nghệ đỉnh cao, vật liệu tốt nhất, giá cao. Cho người chơi nghiêm túc.</p><h2>Victor (Đài Loan)</h2><p>Chất lượng/giá tốt, đa dạng model.</p><h2>Li-Ning (TQ)</h2><p>Thiết kế hiện đại, thời trang.</p>',
 N'So sánh',N'MHShop Expert','#374151',9,0,1);
GO

-- ============================================================
-- Xác nhận
-- ============================================================
SELECT 'Users'      AS [Table], COUNT(*) AS Records FROM Users      UNION ALL
SELECT 'Products',               COUNT(*)            FROM Products   UNION ALL
SELECT 'Promotions',             COUNT(*)            FROM Promotions UNION ALL
SELECT 'News',                   COUNT(*)            FROM News       UNION ALL
SELECT 'Settings',               COUNT(*)            FROM Settings;
PRINT '=== Seed data hoàn tất! ===';
GO
