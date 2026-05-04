import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

export interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number;
  image_url?: string;
  brand?: string;
  is_featured?: boolean;
  is_new?: boolean;
}

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const wished = isInWishlist(String(product.id));

  return (
    <div className="product-card group">
      <Link to={`/products/${product.id}`}>
        <div className="relative h-52 overflow-hidden bg-gray-50">
          <img
            src={
              product.image_url ||
              `https://via.placeholder.com/300x220?text=${encodeURIComponent(product.name)}`
            }
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/300x220?text=No+Image';
            }}
          />
          {product.old_price && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{Math.round((1 - product.price / product.old_price) * 100)}%
            </span>
          )}
          {product.is_new && !product.old_price && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              MỚI
            </span>
          )}
        </div>
        <div className="p-3">
          {product.brand && (
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
              {product.brand}
            </p>
          )}
          <h3 className="text-sm font-semibold text-dark line-clamp-2 mb-2 min-h-[40px]">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">{formatCurrency(product.price)}</span>
            {product.old_price && (
              <span className="text-gray-400 text-xs line-through">
                {formatCurrency(product.old_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3 flex gap-2">
        <button
          onClick={() =>
            addItem({
              id: String(product.id),
              name: product.name,
              price: product.price,
              image: product.image_url || '',
            })
          }
          className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded hover:bg-primary-hover transition-colors flex items-center justify-center gap-1"
        >
          <ShoppingCart className="w-3 h-3" /> Thêm vào giỏ
        </button>
        <button
          onClick={() =>
            toggleItem({
              id: String(product.id),
              name: product.name,
              price: product.price,
              image: product.image_url || '',
            })
          }
          className={`w-8 h-8 border rounded flex items-center justify-center transition-colors flex-shrink-0 ${
            wished
              ? 'bg-red-50 border-red-300 text-red-500'
              : 'border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-400'
          }`}
        >
          <Heart className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
