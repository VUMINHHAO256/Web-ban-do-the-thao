import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Về MHShop */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">VỀ MHShop</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/about" className="hover:text-primary transition-colors">Giới thiệu</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Điều khoản sử dụng</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Tuyển dụng</Link></li>
            </ul>
          </div>

          {/* Hỗ trợ khách hàng */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">HỖ TRỢ KHÁCH HÀNG</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/guide" className="hover:text-primary transition-colors">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Chính sách vận chuyển</Link></li>
              <li><Link to="/payment" className="hover:text-primary transition-colors">Phương thức thanh toán</Link></li>
            </ul>
          </div>

          {/* Dịch vụ */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">DỊCH VỤ</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-primary transition-colors">Bảo hành vợt cầu lông</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Đan lại cước vợt</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tư vấn lựa chọn vợt</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">In thêu logo lên áo</a></li>
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary">THÔNG TIN LIÊN HỆ</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Thôn Đỗ Xá, Yên Mỹ, Hưng Yên</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:0327711655" className="hover:text-primary transition-colors">0327.711.655</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:vuminhhao@mhshop.vn" className="hover:text-primary transition-colors">vuminhhao@mhshop.vn</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <span>8:00 - 21:00 (Tất cả các ngày)</span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex gap-3 mt-4 text-sm">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors font-medium">📘 Facebook</a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors font-medium">📺 YouTube</a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors font-medium">💬 Zalo</a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700 text-center py-4 text-sm text-gray-500">
        © 2025 MHShop - Cửa hàng đồ cầu lông chuyên nghiệp. Tất cả quyền được bảo lưu.
      </div>
    </footer>
  );
};

export default Footer;
