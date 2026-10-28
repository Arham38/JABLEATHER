import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { productService } from '../../services/productService';
import Hero from '../../components/home/Hero';
import ShopByCategory from '../../components/home/ShopByCategory';
import EditorialBanner from '../../components/home/EditorialBanner';
import FeaturedCollectionSection from '../../components/home/FeaturedCollectionSection';
import WhyChooseUs from '../../components/home/WhyChooseUs';
import WorkshopStory from '../../components/home/WorkshopStory';
import CustomWholesale from '../../components/home/CustomWholesale';
import CatalogCTA from '../../components/home/CatalogCTA';
import GallerySection from '../../components/home/GallerySection';
import ReviewsSection from '../../components/home/ReviewsSection';
import Newsletter from '../../components/home/Newsletter';
import SocialSection from '../../components/home/SocialSection';
import ProductGrid from '../../components/product/ProductGrid';

export const HomePage = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    const loadHomeProducts = async () => {
      try {
        const [best, news] = await Promise.all([
          productService.getBestSellers(4),
          productService.getNewArrivals(4),
        ]);
        setBestSellers(best);
        setNewArrivals(news);
      } catch (err) {
        console.error('Error loading homepage products:', err);
        setProductsError(err.message || 'Could not load homepage products.');
      } finally {
        setLoading(false);
      }
    };

    loadHomeProducts();
  }, []);

  return (
    <div className="w-full">
      {/* 3. Hero Section */}
      <Hero />

      {/* 4. Shop by Category */}
      <ShopByCategory />

      {/* 5. Best Sellers */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDD8D0]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
              Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/best-sellers"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#171717] hover:text-[#A66A3F] transition mt-4 sm:mt-0 group"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ProductGrid products={bestSellers} isLoading={loading} error={productsError} />
      </section>

      {/* 6. New Arrivals */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDD8D0]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
              Fresh Off The Bench
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/new-arrivals"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#171717] hover:text-[#A66A3F] transition mt-4 sm:mt-0 group"
          >
            <span>View All New Arrivals</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ProductGrid products={newArrivals} isLoading={loading} error={productsError} />
      </section>

      {/* 7. Editorial Banner */}
      <EditorialBanner />

      {/* 8. Featured Collection */}
      <FeaturedCollectionSection />

      {/* 9. Why Choose JAB Leather */}
      <WhyChooseUs />

      {/* 10. Manufacturing / Workshop Story */}
      <WorkshopStory />

      {/* 11. Custom & Wholesale */}
      <CustomWholesale />

      {/* 12. Catalog CTA */}
      <CatalogCTA />

      {/* 13. Product Gallery */}
      <GallerySection />

      {/* 14. Reviews */}
      <ReviewsSection />

      {/* 15. Newsletter */}
      <Newsletter />

      {/* 16. Social Section */}
      <SocialSection />
    </div>
  );
};

export default HomePage;
