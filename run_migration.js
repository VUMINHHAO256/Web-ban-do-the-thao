/**
 * Script chạy migration thêm cột brand vào Products
 * Usage: node run_migration.js
 */
const { poolPromise, sql } = require('./backend/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Đang chạy migration: 06_add_brand_column.sql ...');
  
  try {
    const pool = await poolPromise;
    if (!pool) throw new Error('Không kết nối được database');

    // 1. Thêm cột brand
    const checkCol = await pool.request().query(
      `SELECT COL_LENGTH('Products', 'brand') AS len`
    );
    
    if (!checkCol.recordset[0].len) {
      await pool.request().query(
        `ALTER TABLE Products ADD brand NVARCHAR(100) NULL`
      );
      console.log('✅ Đã thêm cột brand vào bảng Products');
    } else {
      console.log('⏭️  Cột brand đã tồn tại, bỏ qua');
    }

    // 2. Cập nhật brand theo tên sản phẩm
    const brands = [
      { name: 'Yonex',   likePatterns: ["name LIKE N'%Yonex%'",   "id LIKE '%yonex%'"] },
      { name: 'Victor',  likePatterns: ["name LIKE N'%Victor%'",  "id LIKE '%victor%'"] },
      { name: 'Li-Ning', likePatterns: ["name LIKE N'%Li-Ning%'", "name LIKE N'%Lining%'", "id LIKE '%lining%'"] },
      { name: 'Babolat', likePatterns: ["name LIKE N'%Babolat%'", "id LIKE '%babolat%'"] },
      { name: 'Adidas',  likePatterns: ["name LIKE N'%Adidas%'",  "id LIKE '%adidas%'"] },
      { name: 'VS',      likePatterns: ["name LIKE N'%VS %'",     "id LIKE '%vs-%'"] },
      { name: 'Kumpoo',  likePatterns: ["name LIKE N'%Kumpoo%'",  "id LIKE '%kumpoo%'"] },
      { name: 'Asics',   likePatterns: ["name LIKE N'%Asics%'",   "id LIKE '%asics%'"] },
      { name: 'Mizuno',  likePatterns: ["name LIKE N'%Mizuno%'",  "id LIKE '%mizuno%'"] },
      { name: 'RSL',     likePatterns: ["name LIKE N'%RSL%'",     "id LIKE '%rsl%'"] },
    ];

    for (const brand of brands) {
      const whereClause = brand.likePatterns.join(' OR ');
      const result = await pool.request()
        .input('brand', sql.NVarChar, brand.name)
        .query(`
          UPDATE Products
          SET brand = @brand
          WHERE brand IS NULL AND (${whereClause})
        `);
      if (result.rowsAffected[0] > 0) {
        console.log(`✅ Cập nhật ${result.rowsAffected[0]} sản phẩm → brand = ${brand.name}`);
      }
    }

    // 3. Hiển thị kết quả
    const stats = await pool.request().query(
      `SELECT brand, COUNT(*) AS soLuong FROM Products GROUP BY brand ORDER BY soLuong DESC`
    );
    
    console.log('\n📊 Thống kê brand sau migration:');
    stats.recordset.forEach(row => {
      console.log(`  ${row.brand || '(chưa có brand)'}: ${row.soLuong} sản phẩm`);
    });

    console.log('\n🎉 Migration hoàn tất!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi migration:', err.message);
    process.exit(1);
  }
}

runMigration();
