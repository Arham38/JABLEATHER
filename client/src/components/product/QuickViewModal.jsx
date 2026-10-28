import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Truck, ShoppingBag, Eye, Heart, Check } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency, calculateDiscountPercentage } from '../../utils/currency';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';

export const QuickViewModal = () => {
  const { quickViewProduct, closeQuickView } = useUI();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedSize(quickViewProduct.sizes?.[0] || 'Standard');
      setSelectedColor(quickViewProduct.colors?.[0] || null);
      setSelectedImage(quickViewProduct.images?.[0] || '');
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const discountPct = calculateDiscountPercentage(
    quickViewProduct.price,
    quickViewProduct.compareAtPrice
  );

  const handleAddToCart = () => {
    addToCart(quickViewProduct, {
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    closeQuickView();
  };

  const handleViewFullProduct = () => {
    closeQuickView();
    navigate(`/product/${quickViewProduct.slug}`);
  };

  return (
    <Modal
      isOpen={!!quickViewProduct}
      onClose={closeQuickView}
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 -m-6 p-6">
        {/* Left Column: Product Gallery */}
        <div className="space-y-3">
          <div className="aspect-3/4 bg-stone-100 rounded-sm overflow-hidden border border-stone-200 relative">
            <img
              src={selectedImage || quickViewProduct.images?.[0]}
              alt={quickViewProduct.name}
              className="w-full h-full object-cover object-center"
            />
            {discountPct > 0 && (
              <Badge variant="sale" className="absolute top-3 left-3">
                Save {discountPct}%
              </Badge>
            )}
          </div>

          {/* Thumbnails */}
          {quickViewProduct.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {quickViewProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 shrink-0 rounded-xs overflow-hidden border-2 transition ${
                    selectedImage === img
                      ? 'border-[#171717]'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-[#6B665F] mb-1">
              <span className="uppercase tracking-wider font-semibold">
                {quickViewProduct.categoryName}
              </span>
              <span>SKU: {quickViewProduct.sku}</span>
            </div>

            <h2 className="text-xl font-bold text-[#171717] leading-snug">
              {quickViewProduct.name}
            </h2>

            {/* Rating & In Stock */}
            <div className="flex items-center gap-3 mt-2">
              {quickViewProduct.rating != null && (
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-xs font-bold text-stone-900 ml-1">
                    {quickViewProduct.rating}
                  </span>
                  <span className="text-xs text-[#6B665F] ml-1">
                    ({quickViewProduct.reviewCount} reviews)
                  </span>
                </div>
              )}
              {quickViewProduct.rating != null && <span className="text-stone-300">•</span>}
              <span className={`text-xs font-semibold flex items-center gap-1 ${quickViewProduct.inStock ? 'text-emerald-700' : 'text-red-700'}`}>
                {quickViewProduct.inStock && <Check className="w-3.5 h-3.5" />}
                {quickViewProduct.inStock ? `In Stock (${quickViewProduct.stockCount} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl font-extrabold text-[#171717]">
                {formatCurrency(quickViewProduct.price, quickViewProduct.currency)}
              </span>
              {quickViewProduct.compareAtPrice && (
                <span className="text-sm text-stone-400 line-through">
                  {formatCurrency(quickViewProduct.compareAtPrice, quickViewProduct.currency)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-[#6B665F] leading-relaxed mt-3 line-clamp-3">
              {quickViewProduct.description}
            </p>

            {/* Color Swatches */}
            {quickViewProduct.colors?.length > 0 && (
              <div className="mt-4">
                <label className="block text-xs uppercase tracking-wider font-bold text-[#1C1C1C] mb-1.5">
                  Color: <span className="font-semibold text-[#A66A3F]">{selectedColor?.name}</span>
                </label>
                <div className="flex items-center gap-2">
                  {quickViewProduct.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-all p-0.5 flex items-center justify-center ${
                        selectedColor?.name === color.name
                          ? 'border-[#171717] scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      title={color.name}
                      aria-label={`Select color ${color.name}`}
                    >
                      <span
                        className="w-full h-full rounded-full border border-black/20 block"
                        style={{ backgroundColor: color.hex || '#a8a29e' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {quickViewProduct.sizes?.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs uppercase tracking-wider font-bold text-[#1C1C1C]">
                    Size: <span className="text-[#A66A3F]">{selectedSize}</span>
                  </label>
                  <Link
                    to="/contact#size-guide"
                    onClick={closeQuickView}
                    className="text-[11px] text-[#A66A3F] hover:underline"
                  >
                    Size Guide
                  </Link>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {quickViewProduct.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 text-xs font-semibold rounded-xs border transition ${
                        selectedSize === size
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-white text-[#1C1C1C] border-[#DDD8D0] hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wider font-bold text-[#1C1C1C] mb-1.5">
                Quantity
              </label>
              <div className="flex items-center border border-[#DDD8D0] rounded-xs w-28 bg-stone-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-stone-600 hover:text-black font-bold"
                >
                  -
                </button>
                <span className="flex-1 text-center text-xs font-bold text-[#171717]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-stone-600 hover:text-black font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-4 border-t border-[#DDD8D0]">
            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                disabled={!quickViewProduct.inStock}
                onClick={handleAddToCart}
                className="gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </Button>

              <button
                onClick={() => toggleWishlist(quickViewProduct)}
                className={`p-3 border rounded-xs transition ${
                  isInWishlist(quickViewProduct.id)
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-[#DDD8D0] text-[#1C1C1C] hover:bg-stone-50'
                }`}
                aria-label="Save to wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(quickViewProduct.id) ? 'fill-red-500' : ''
                  }`}
                />
              </button>
            </div>

            <Button
              variant="outline"
              fullWidth
              size="sm"
              onClick={handleViewFullProduct}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>View Full Details & Specifications</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuickViewModal;
