import React from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import QuickViewModal from '../product/QuickViewModal';
import SearchOverlay from './SearchOverlay';

export const StorefrontLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#1C1C1C]">
      {/* Global Announcements */}
      <AnnouncementBar message="Worldwide Shipping • Custom & Wholesale Orders Welcome" />

      {/* Responsive Headers */}
      <Header />
      <MobileHeader />

      {/* Main Routed Content */}
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <QuickViewModal />
      <SearchOverlay />
    </div>
  );
};

export default StorefrontLayout;
