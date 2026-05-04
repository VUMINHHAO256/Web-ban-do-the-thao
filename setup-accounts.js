/**
 * setup-accounts.js
 * Tạo/cập nhật tài khoản Admin và User mẫu trong MHShopDB
 * Chạy: node setup-accounts.js
 */
require('dotenv').config({ path: './.env' });
const bcrypt = require('bcryptjs');
const { poolPromise } = require('./backend/db');

async function setup() {
    const pool = await poolPromise;

    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash  = await bcrypt.hash('user123', 10);

    // ── Admin account ──────────────────────────────────────
    const adminExists = await pool.request()
        .input('email', 'admin@mhshop.com')
        .query('SELECT id FROM Users WHERE email = @email');

    if (adminExists.recordset.length > 0) {
        await pool.request()
            .input('hash',  adminHash)
            .input('email', 'admin@mhshop.com')
            .query("UPDATE Users SET password = @hash, role = 'admin' WHERE email = @email");
        console.log('✅ Admin account updated: admin@mhshop.com / admin123');
    } else {
        await pool.request()
            .input('fn',    'Admin')
            .input('ln',    'System')
            .input('email', 'admin@mhshop.com')
            .input('phone', '0123456789')
            .input('hash',  adminHash)
            .query("INSERT INTO Users(firstName,lastName,email,phone,password,role) VALUES(@fn,@ln,@email,@phone,@hash,'admin')");
        console.log('✅ Admin account created: admin@mhshop.com / admin123');
    }

    // ── Demo user account ──────────────────────────────────
    const userExists = await pool.request()
        .input('email', 'user@mhshop.com')
        .query('SELECT id FROM Users WHERE email = @email');

    if (userExists.recordset.length > 0) {
        await pool.request()
            .input('hash',  userHash)
            .input('email', 'user@mhshop.com')
            .query("UPDATE Users SET password = @hash, role = 'user' WHERE email = @email");
        console.log('✅ User account updated:  user@mhshop.com  / user123');
    } else {
        await pool.request()
            .input('fn',    'Nguyen')
            .input('ln',    'Van A')
            .input('email', 'user@mhshop.com')
            .input('phone', '0987654321')
            .input('hash',  userHash)
            .query("INSERT INTO Users(firstName,lastName,email,phone,password,role) VALUES(@fn,@ln,@email,@phone,@hash,'user')");
        console.log('✅ User account created:  user@mhshop.com  / user123');
    }

    console.log('\n=== THÔNG TIN TÀI KHOẢN ===');
    console.log('👑 Admin : admin@mhshop.com  | admin123 | http://localhost:5173/admin');
    console.log('👤 User  : user@mhshop.com   | user123  | http://localhost:5173/');
    process.exit(0);
}

setup().catch(e => { console.error('❌', e.message); process.exit(1); });
