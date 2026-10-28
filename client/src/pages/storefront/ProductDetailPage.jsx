import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingBag,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Share2,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, calculateDiscountPercentage } from '../../utils/currency';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProductGrid from '../../components/product/ProductGrid';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Variant selections
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'details' | 'shipping' | 'reviews'

  // New review form
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const realRating = useMemo(() => {
    if (reviews.length === 0) return product?.rating || null;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Number(avg.toFixed(1));
  }, [reviews, product?.rating]);

  const realReviewCount = reviews.length > 0 ? reviews.length : (product?.reviewCount || 0);

  useEffect(() => {
    const loadProductData = async () => {
      setIsLoading(true);
      setLoadError('');
      window.scrollTo(0, 0);
      try {
        const prod = await productService.getProductBySlug(slug);
        setProduct(prod);
        setSelectedSize(prod.sizes?.[0] || 'Standard');
        setSelectedColor(prod.colors?.[0] || null);
        setActiveImageIdx(0);
        setQuantity(1);

        try {
          const [revs, related] = await Promise.all([
            reviewService.getProductReviews(prod.id),
            productService.getRelatedProducts(prod.id, 4),
          ]);
          setReviews(revs || []);
          setRelatedProducts(related || []);
        } catch (subErr) {
          console.warn('Review or related products fetch notice:', subErr.message);
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setLoadError(err.message || 'Could not load product details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#171717] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-[#6B665F]">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div role={loadError ? 'alert' : undefined} className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-[#171717] mb-4">{loadError ? 'Product Unavailable' : 'Product Not Found'}</h2>
        {loadError && <p className="text-sm text-[#6B665F] mb-4">{loadError}</p>}
        <Link to="/shop">
          <Button variant="primary" size="sm">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const discountPct = calculateDiscountPercentage(product.price, product.compareAtPrice);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, {
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
  };

  const handleBuyNow = () => {
    addToCart(product, {
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewComment) {
      toast.error('Please enter your name and comment');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await reviewService.submitReview({
        productId: product.id,
        productName: product.name,
        author: newReviewAuthor,
        title: newReviewTitle || 'Quality Craftsmanship',
        comment: newReviewComment,
        rating: newReviewRating,
      });
      setNewReviewAuthor('');
      setNewReviewTitle('');
      setNewReviewComment('');
      toast.success('Thank you! Your review has been submitted for atelier moderation.');
    } catch (err) {
      toast.error(err.message || 'Could not submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Shop', to: '/shop' },
          { label: product.categoryName, to: `/category/${product.category}` },
          { label: product.name },
        ]}
      />

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-6">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visual Stage */}
          <div className="relative aspect-4/5 bg-stone-100 rounded-xs overflow-hidden border border-[#DDD8D0] group">
            <img
              src={product.images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.isBestSeller && <Badge variant="bestseller">Best Seller</Badge>}
              {product.isNewArrival && <Badge variant="new">New Arrival</Badge>}
              {discountPct > 0 && <Badge variant="sale">Save {discountPct}%</Badge>}
            </div>

            {/* Lightbox Trigger */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-4 right-4 bg-white/80 backdrop-blur-xs p-2.5 rounded-full text-stone-800 hover:bg-white hover:text-black shadow-md transition"
              aria-label="Zoom image"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Prev / Next Controls */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIdx(
                      (prev) => (prev - 1 + product.images.length) % product.images.length
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center shadow-md transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) => (prev + 1) % product.images.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center shadow-md transition"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-24 rounded-xs overflow-hidden shrink-0 border-2 transition ${
                    activeImageIdx === idx
                      ? 'border-[#171717] opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchasing (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            {/* Top metadata */}
            <div className="flex items-center justify-between text-xs text-[#6B665F] mb-2">
              <span className="uppercase tracking-wider font-bold text-[#A66A3F]">
                {product.categoryName}
              </span>
              <span>SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating & Stock */}
            <div className="flex items-center gap-3 mb-4">
              {realRating != null && (
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-xs font-bold text-stone-900 ml-1">{realRating}</span>
                  <span className="text-xs text-[#6B665F] ml-1">({realReviewCount} reviews)</span>
                </div>
              )}
              {realRating != null && <span className="text-stone-300">•</span>}
              <span className={`text-xs font-semibold flex items-center gap-1 ${product.inStock ? 'text-emerald-700' : 'text-red-700'}`}>
                {product.inStock && <Check className="w-3.5 h-3.5" />}
                {product.inStock ? `In Stock (${product.stockCount} Available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 py-3 border-y border-[#DDD8D0]">
              <span className="text-3xl font-extrabold text-[#171717]">
                {formatCurrency(product.price, product.currency)}
              </span>
              {product.compareAtPrice && (
                <span className="text-base text-stone-400 line-through">
                  {formatCurrency(product.compareAtPrice, product.currency)}
                </span>
              )}
            </div>

            {/* Description Short */}
            <p className="text-xs sm:text-sm text-[#6B665F] leading-relaxed my-5">
              {product.description}
            </p>

            {/* Color Swatch Matrix */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider font-bold text-[#1C1C1C] mb-2">
                  Leather Finish / Color: <span className="text-[#A66A3F]">{selectedColor?.name}</span>
                </label>
                <div className="flex items-center gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 flex items-center justify-center ${
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

            {/* Size Matrix */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-[#1C1C1C]">
                    Size: <span className="text-[#A66A3F]">{selectedSize}</span>
                  </label>
                  <Link to="/contact#size-guide" className="text-xs text-[#A66A3F] hover:underline font-semibold">
                    Size & Fit Guide
                  </Link>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-xs font-bold rounded-xs border transition ${
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
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider font-bold text-[#1C1C1C] mb-2">
                Quantity
              </label>
              <div className="flex items-center border border-[#DDD8D0] rounded-xs w-32 bg-stone-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-stone-600 hover:text-black font-bold"
                >
                  -
                </button>
                <span className="flex-1 text-center text-xs font-bold text-[#171717]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-stone-600 hover:text-black font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  className="gap-2 font-bold shadow-md"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add to Bag</span>
                </Button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 border rounded-xs transition ${
                    isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-[#DDD8D0] text-[#1C1C1C] hover:bg-stone-50'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3.5 border border-[#DDD8D0] rounded-xs text-[#1C1C1C] hover:bg-stone-50 transition"
                  aria-label="Share product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <Button
                variant="accent"
                size="lg"
                fullWidth
                onClick={handleBuyNow}
                className="font-bold shadow-md"
              >
                Instant Buy Now
              </Button>
            </div>

            {/* Value Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-[#DDD8D0] text-[11px] text-[#6B665F]">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#A66A3F] shrink-0" />
                <span>Express Global Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#A66A3F] shrink-0" />
                <span>100% Genuine Leather</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-[#A66A3F] shrink-0" />
                <span>Easy 30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Accordions Section */}
      <div className="mt-20 pt-10 border-t border-[#DDD8D0]">
        {/* Tab Buttons */}
        <div className="flex border-b border-[#DDD8D0] gap-8 overflow-x-auto">
          {[
            { id: 'description', label: 'Description' },
            { id: 'details', label: 'Specifications & Materials' },
            { id: 'shipping', label: 'Shipping & Returns' },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-xs uppercase tracking-wider font-bold transition whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#171717] text-[#171717]'
                  : 'border-transparent text-[#6B665F] hover:text-[#171717]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div className="py-8 text-sm text-[#1C1C1C]">
          {activeTab === 'description' && (
            <div className="max-w-3xl space-y-4 leading-relaxed text-stone-700">
              <p>{product.description}</p>
              <p>
                Each jacket is individually cut and tailored in our Sialkot atelier. We utilize high-tensile bonded thread with double-needle French seams on all stress intersections to ensure lifetimes of rugged daily wear.
              </p>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="max-w-2xl">
              <dl className="divide-y divide-stone-200 text-xs">
                <div className="py-3 grid grid-cols-3">
                  <dt className="font-bold text-[#171717]">Primary Material</dt>
                  <dd className="col-span-2 text-[#6B665F]">{product.material}</dd>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <dt className="font-bold text-[#171717]">Leather Grade</dt>
                  <dd className="col-span-2 text-[#6B665F]">{product.leatherType}</dd>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <dt className="font-bold text-[#171717]">Interior Lining</dt>
                  <dd className="col-span-2 text-[#6B665F]">{product.lining}</dd>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <dt className="font-bold text-[#171717]">Hardware & Zippers</dt>
                  <dd className="col-span-2 text-[#6B665F]">{product.closure}</dd>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <dt className="font-bold text-[#171717]">Fit Profile</dt>
                  <dd className="col-span-2 text-[#6B665F]">{product.fit}</dd>
                </div>
                <div className="py-3 grid grid-cols-3">
                  <dt className="font-bold text-[#171717]">Care Instructions</dt>
                  <dd className="col-span-2 text-[#6B665F]">{product.care}</dd>
                </div>
              </dl>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-3xl space-y-4 text-stone-700 text-xs leading-relaxed">
              <h4 className="font-bold text-sm text-[#171717]">Worldwide Express Dispatch</h4>
              <p>
                Orders are dispatched directly from our export hub in Sialkot, Pakistan via DHL Express or FedEx International Priority.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Complimentary Worldwide Shipping on all orders over $150.</li>
                <li>Standard delivery timeline: 4–7 business days with online tracking.</li>
                <li>Hassle-free 30-day exchange and return policy on unworn items with tags intact.</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Reviews List */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#171717]">Verified Customer Feedback</h4>
                  {reviews.length === 0 ? (
                    <p className="text-xs text-[#6B665F]">No reviews yet. Be the first to share your thoughts!</p>
                  ) : (
                    reviews.map((r) => (
                      <div key={r.id} className="p-4 bg-white rounded-xs border border-[#DDD8D0]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-[#171717]">{r.author}</span>
                          <span className="text-[10px] text-stone-400">{r.date}</span>
                        </div>
                        <div className="flex text-amber-500 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <h5 className="text-xs font-bold text-[#171717] mb-1">{r.title}</h5>
                        <p className="text-xs text-[#6B665F] leading-relaxed">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Submit Demo Review Form */}
                <div className="bg-white p-6 rounded-xs border border-[#DDD8D0]">
                  <h4 className="font-bold text-sm text-[#171717] mb-4">Write a Review</h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#1C1C1C] mb-1">
                        Rating
                      </label>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-[#DDD8D0] rounded-xs bg-stone-50"
                      >
                        <option value={5}>5 Stars - Outstanding Quality</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Average</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#1C1C1C] mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        placeholder="e.g. David M."
                        className="w-full text-xs p-2 border border-[#DDD8D0] rounded-xs focus:outline-none focus:border-[#171717]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#1C1C1C] mb-1">
                        Review Title
                      </label>
                      <input
                        type="text"
                        value={newReviewTitle}
                        onChange={(e) => setNewReviewTitle(e.target.value)}
                        placeholder="e.g. Exceptional leather hide and stitching"
                        className="w-full text-xs p-2 border border-[#DDD8D0] rounded-xs focus:outline-none focus:border-[#171717]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#1C1C1C] mb-1">
                        Your Feedback
                      </label>
                      <textarea
                        rows={3}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Describe the fit, leather feel, and craftsmanship..."
                        className="w-full text-xs p-2 border border-[#DDD8D0] rounded-xs focus:outline-none focus:border-[#171717]"
                        required
                      />
                    </div>

                    <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingReview}>
                      Submit Review
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-[#DDD8D0]">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#171717] mb-8">
            Complete the Look & Related Pieces
          </h3>
          <ProductGrid products={relatedProducts} />
        </section>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white p-2"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={product.images[activeImageIdx]}
            alt={product.name}
            className="max-h-[85vh] max-w-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
