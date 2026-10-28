import React from 'react';
import { NavLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, User, MapPin, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from '../../components/common/Breadcrumbs';

export const AccountLayout = () => {
  const { customer, loading, logoutCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logoutCustomer();
    navigate('/account/login');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-xs text-[#6B665F]">
        Loading your account session...
      </div>
    );
  }

  if (!customer) {
    return <Navigate to="/account/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { label: 'Overview', to: '/account', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Orders', to: '/account/orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Profile Details', to: '/account/profile', icon: <User className="w-4 h-4" /> },
    { label: 'Addresses', to: '/account/addresses', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Wishlist', to: '/account/wishlist', icon: <Heart className="w-4 h-4" /> },
    { label: 'Settings', to: '/account/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'My Account' }]} />

      {/* Account Header */}
      <div className="py-6 border-b border-[#DDD8D0] mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F]">
            Client Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
            Welcome, {customer?.name || 'Valued Customer'}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#DDD8D0] text-xs font-bold uppercase tracking-wider text-red-700 hover:bg-red-50 rounded-xs transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-[#DDD8D0] rounded-xs overflow-hidden">
          <nav className="divide-y divide-stone-100">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/account'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-3.5 text-xs font-bold transition ${
                    isActive
                      ? 'bg-[#171717] text-white'
                      : 'text-[#1C1C1C] hover:bg-stone-50 hover:text-[#A66A3F]'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Content Outlet (9 cols) */}
        <div className="lg:col-span-9 bg-white border border-[#DDD8D0] rounded-xs p-6 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
