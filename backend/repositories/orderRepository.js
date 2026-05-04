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
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Insert Order
            const orderReq = new sql.Request(transaction);
            orderReq.input('userId',          sql.Int,       order.userId || null);
            orderReq.input('customerName',    sql.NVarChar,  order.customerName);
            orderReq.input('customerPhone',   sql.VarChar,   order.customerPhone);
            orderReq.input('customerAddress', sql.NVarChar,  order.customerAddress);
            orderReq.input('totalAmount',     sql.Int,        order.totalAmount);
            orderReq.input('paymentMethod',   sql.NVarChar,  order.paymentMethod || 'cod');
            orderReq.input('status',          sql.VarChar,   'pending');

            const orderResult = await orderReq.query(`
                INSERT INTO Orders (userId, customerName, customerPhone, customerAddress, totalAmount, paymentMethod, status)
                OUTPUT INSERTED.id
                VALUES (@userId, @customerName, @customerPhone, @customerAddress, @totalAmount, @paymentMethod, @status)
            `);

            const orderId = orderResult.recordset[0].id;

            // 2. Insert Items & Update Stock
            for (const item of items) {
                // Kiểm tra tồn kho
                const stockReq = new sql.Request(transaction);
                stockReq.input('productId', sql.VarChar, item.id);
                const stockRes = await stockReq.query('SELECT stock, name FROM Products WHERE id = @productId');

                if (stockRes.recordset.length === 0) {
                    throw new Error(`Sản phẩm ID "${item.id}" không tồn tại`);
                }
                const { stock, name } = stockRes.recordset[0];
                if (stock < item.quantity) {
                    throw new Error(`Sản phẩm "${name}" không đủ số lượng (chỉ còn ${stock})`);
                }

                // Insert OrderItem
                const itemReq = new sql.Request(transaction);
                itemReq.input('orderId',   sql.Int,      orderId);
                itemReq.input('productId', sql.VarChar,  item.id);
                itemReq.input('quantity',  sql.Int,       item.quantity);
                itemReq.input('price',     sql.Int,       item.price);
                await itemReq.query(`
                    INSERT INTO OrderItems (orderId, productId, quantity, price)
                    VALUES (@orderId, @productId, @quantity, @price)
                `);

                // Cập nhật tồn kho
                const updateReq = new sql.Request(transaction);
                updateReq.input('productId', sql.VarChar, item.id);
                updateReq.input('quantity',  sql.Int,      item.quantity);
                await updateReq.query('UPDATE Products SET stock = stock - @quantity WHERE id = @productId');
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
                o.*,
                u.firstName + ' ' + u.lastName AS userFullName,
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
                    o.*,
                    u.firstName + ' ' + u.lastName AS userFullName,
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
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM Orders WHERE userId = @userId ORDER BY createdAt DESC');
        return result.recordset;
    }

    async updateStatus(id, status) {
        const pool = await this._getPool();
        await pool.request()
            .input('id',     sql.Int,     id)
            .input('status', sql.VarChar, status)
            .query('UPDATE Orders SET status = @status WHERE id = @id');
    }
}

module.exports = new OrderRepository();
