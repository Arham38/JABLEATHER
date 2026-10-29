import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/currency';
import Button from '../../components/common/Button';

export const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const handleMoveToCart = (product) => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to move items to your bag.');
      return;
    }
    addToCart(product, {
      size: product.sizes?.[0] || 'Standard',
      color: product.colors?.[0] || null,
      quantity: 1,
    });
    removeFromWishlist(product.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-[#171717]">
            My Wishlist ({wishlistItems.length})
          </h2>
          <p className="text-xs text-[#6B665F] mt-0.5">
            Saved leather jackets and artisanal accessories for later purchase.
          </p>
        </div>
        {wishlistItems.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs text-stone-500 hover:text-red-700 underline"
          >
            Clear All
          </button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="py-16 text-center text-xs text-[#6B665F] space-y-4">
          <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#171717]">Your Wishlist is Empty</h3>
          <p className="max-w-xs mx-auto">
            Browse our handcrafted leather collections and save your favorite outerwear designs.
          </p>
          <Link to="/shop">
            <Button variant="primary" size="sm">Explore Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistItems.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-[#DDD8D0] rounded-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-3/4 bg-stone-100 overflow-hidden">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur-xs p-1.5 rounded-full text-stone-700 hover:text-red-700 shadow-sm"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A66A3F] block">
                    {product.categoryName}
                  </span>
                  <Link
                    to={`/product/${product.slug}`}
                    className="text-xs font-bold text-[#171717] hover:text-[#A66A3F] line-clamp-1 block mt-0.5"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs font-extrabold text-[#171717] mt-1">
                    {formatCurrency(product.price, product.currency)}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => handleMoveToCart(product)}
                  className="gap-2 font-bold"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Bag</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
