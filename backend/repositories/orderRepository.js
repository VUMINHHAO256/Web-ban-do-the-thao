const { poolPromise, sql } = require('../db');

class OrderRepository {
    async _getPool() {
        const pool = await poolPromise;
        if (!pool) throw new Error('Database không kết nối được.');
        return pool;
    }

    // Tạo đơn hàng (transaction)
    async createOrder(order, items) {
        const pool = await this._getPool();

        // Kiểm tra cột paymentMethod, note, promoCode, discountAmount có tồn tại không
        const colCheck = await pool.request().query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Orders'
              AND COLUMN_NAME IN ('paymentMethod', 'note', 'transactionId', 'promoCode', 'discountAmount')
        `);
        const existingCols     = colCheck.recordset.map(r => r.COLUMN_NAME);
        const hasPaymentMethod = existingCols.includes('paymentMethod');
        const hasNote          = existingCols.includes('note');
        const hasPromoCode     = existingCols.includes('promoCode');
        const hasDiscountAmount = existingCols.includes('discountAmount');

        // Nếu chưa có cột promo, tự động tạo
        if (!hasPromoCode) {
            await pool.request().query(
                `ALTER TABLE Orders ADD promoCode VARCHAR(50) NULL`
            );
        }
        if (!hasDiscountAmount) {
            await pool.request().query(
                `ALTER TABLE Orders ADD discountAmount INT NULL DEFAULT 0`
            );
        }

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Insert Order — chỉ thêm cột đã tồn tại
            const orderReq = new sql.Request(transaction);
            orderReq.input('userId',          sql.Int,      order.userId || null);
            orderReq.input('customerName',    sql.NVarChar, order.customerName);
            orderReq.input('customerPhone',   sql.VarChar,  order.customerPhone);
            orderReq.input('customerAddress', sql.NVarChar, order.customerAddress);
            orderReq.input('totalAmount',     sql.Int,      order.totalAmount);
            orderReq.input('status',          sql.VarChar,  'pending');

            let extraCols   = '';
            let extraValues = '';
            if (hasPaymentMethod) {
                orderReq.input('paymentMethod', sql.NVarChar, order.paymentMethod || 'cod');
                extraCols   += ', paymentMethod';
                extraValues += ', @paymentMethod';
            }
            if (hasNote && order.note) {
                orderReq.input('note', sql.NVarChar, order.note);
                extraCols   += ', note';
                extraValues += ', @note';
            }
            // Luôn lưu promoCode và discountAmount (cột đã được đảm bảo tồn tại ở trên)
            orderReq.input('promoCode',      sql.VarChar, order.promoCode     || null);
            orderReq.input('discountAmount', sql.Int,     order.discountAmount || 0);
            extraCols   += ', promoCode, discountAmount';
            extraValues += ', @promoCode, @discountAmount';

            const orderResult = await orderReq.query(`
                INSERT INTO Orders (userId, customerName, customerPhone, customerAddress, totalAmount, status${extraCols})
                OUTPUT INSERTED.id
                VALUES (@userId, @customerName, @customerPhone, @customerAddress, @totalAmount, @status${extraValues})
            `);

            const orderId = orderResult.recordset[0].id;

            // 2. Insert Items & Update Stock
            for (const item of items) {
                // Lấy productId dưới dạng string (hỗ trợ cả id kiểu số và kiểu chữ)
                const productId = String(item.product_id || item.id || '').trim();
                if (!productId || productId === 'null' || productId === 'undefined') {
                    throw new Error('Dữ liệu sản phẩm không hợp lệ (ID trống)');
                }

                // Kiểm tra tồn kho (không trừ ngay — sẽ trừ khi hoàn thành đơn)
                const stockReq = new sql.Request(transaction);
                stockReq.input('productId', sql.VarChar, productId);
                const stockRes = await stockReq.query('SELECT stock, name FROM Products WHERE id = @productId');

                if (stockRes.recordset.length === 0) {
                    throw new Error(`Sản phẩm ID "${productId}" không tồn tại`);
                }
                const { stock, name } = stockRes.recordset[0];
                if (stock < item.quantity) {
                    throw new Error(`Sản phẩm "${name}" không đủ số lượng (chỉ còn ${stock})`);
                }

                // Insert OrderItem
                const itemReq = new sql.Request(transaction);
                itemReq.input('orderId',   sql.Int,     orderId);
                itemReq.input('productId', sql.VarChar, productId);
                itemReq.input('quantity',  sql.Int,     item.quantity);
                itemReq.input('price',     sql.Int,     item.price);
                await itemReq.query(`
                    INSERT INTO OrderItems (orderId, productId, quantity, price)
                    VALUES (@orderId, @productId, @quantity, @price)
                `);
            }

            await transaction.commit();
            return orderId;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    async findAll() {
        const pool = await this._getPool();
        const result = await pool.request().query(`
            SELECT 
                o.id,
                o.userId,
                o.customerPhone,
                o.customerAddress,
                o.totalAmount,
                o.status,
                o.paymentMethod,
                o.note,
                o.createdAt,
                COALESCE(
                    CASE WHEN o.userId IS NOT NULL
                         THEN u.firstName + ' ' + u.lastName
                    END,
                    o.customerName
                ) AS customerName,
                u.email AS userEmail
            FROM Orders o
            LEFT JOIN Users u ON o.userId = u.id
            ORDER BY o.createdAt DESC
        `);
        return result.recordset;
    }

    async findById(id) {
        const pool = await this._getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    o.id,
                    o.userId,
                    o.customerPhone,
                    o.customerAddress,
                    o.totalAmount,
                    o.status,
                    o.paymentMethod,
                    o.note,
                    o.createdAt,
                    COALESCE(
                        CASE WHEN o.userId IS NOT NULL
                             THEN u.firstName + ' ' + u.lastName
                        END,
                        o.customerName
                    ) AS customerName,
                    u.email AS userEmail
                FROM Orders o
                LEFT JOIN Users u ON o.userId = u.id
                WHERE o.id = @id
            `);
        return result.recordset[0];
    }

    async findItemsByOrderId(orderId) {
        const pool = await this._getPool();
        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
                SELECT 
                    oi.id,
                    oi.quantity,
                    oi.price,
                    oi.productId,
                    p.name   AS productName,
                    p.image  AS productImage,
                    p.category
                FROM OrderItems oi
                LEFT JOIN Products p ON oi.productId = p.id
                WHERE oi.orderId = @orderId
            `);
        return result.recordset;
    }

    async findByUserId(userId) {
        const pool = await this._getPool();
        // Lấy danh sách đơn hàng
        const orderRes = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM Orders WHERE userId = @userId ORDER BY createdAt DESC');
        const orders = orderRes.recordset;

        // Lấy items (kèm ảnh + tên) cho từng đơn
        for (const order of orders) {
            const itemsRes = await pool.request()
                .input('orderId', sql.Int, order.id)
                .query(`
                    SELECT
                        oi.id,
                        oi.quantity,
                        oi.price,
                        oi.productId,
                        p.name  AS productName,
                        p.image AS productImage,
                        p.category
                    FROM OrderItems oi
                    LEFT JOIN Products p ON oi.productId = p.id
                    WHERE oi.orderId = @orderId
                `);
            order.items = itemsRes.recordset;
        }

        return orders;
    }

    async updateStatus(id, status) {
        const pool = await this._getPool();

        // Lấy trạng thái hiện tại của đơn hàng
        const orderRes = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT status FROM Orders WHERE id = @id');
        if (orderRes.recordset.length === 0) throw new Error('Đơn hàng không tồn tại');
        const currentStatus = orderRes.recordset[0].status;

        // Chỉ xử lý tồn kho khi chuyển sang completed hoặc cancelled
        const needsStockUpdate =
            (status === 'completed' && currentStatus !== 'completed') ||
            (status === 'cancelled' && currentStatus !== 'cancelled');

        if (!needsStockUpdate) {
            // Cập nhật trạng thái đơn giản, không cần transaction
            await pool.request()
                .input('id',     sql.Int,     id)
                .input('status', sql.VarChar, status)
                .query('UPDATE Orders SET status = @status WHERE id = @id');
            return;
        }

        // Cần xử lý tồn kho → dùng transaction
        const items = await this.findItemsByOrderId(id);
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Cập nhật trạng thái đơn hàng
            const statusReq = new sql.Request(transaction);
            statusReq.input('id',     sql.Int,     id);
            statusReq.input('status', sql.VarChar, status);
            await statusReq.query('UPDATE Orders SET status = @status WHERE id = @id');

            for (const item of items) {
                const stockReq = new sql.Request(transaction);
                stockReq.input('productId', sql.VarChar, item.productId);
                stockReq.input('quantity',  sql.Int,     item.quantity);

                if (status === 'completed') {
                    // Hoàn thành → trừ tồn kho
                    const checkRes = await stockReq.query(
                        'SELECT stock, name FROM Products WHERE id = @productId'
                    );
                    if (checkRes.recordset.length > 0) {
                        const { stock, name } = checkRes.recordset[0];
                        if (stock < item.quantity) {
                            throw new Error(`Sản phẩm "${name}" không đủ tồn kho (còn ${stock}, cần ${item.quantity})`);
                        }
                        const updateReq = new sql.Request(transaction);
                        updateReq.input('productId', sql.VarChar, item.productId);
                        updateReq.input('quantity',  sql.Int,     item.quantity);
                        await updateReq.query(
                            'UPDATE Products SET stock = stock - @quantity WHERE id = @productId'
                        );
                    }
                } else if (status === 'cancelled' && currentStatus === 'completed') {
                    // Hủy đơn đã hoàn thành → hoàn trả tồn kho
                    await stockReq.query(
                        'UPDATE Products SET stock = stock + @quantity WHERE id = @productId'
                    );
                }
                // Hủy đơn đang pending/processing → không cần làm gì với stock
            }

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
}

module.exports = new OrderRepository();
