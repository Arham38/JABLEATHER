import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  MessageSquare,
  Tag,
  Sliders,
  Image,
  FileText,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Truck,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout = () => {
  const { admin, loading, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  const navLinks = [
    { label: 'Dashboard', to: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Products', to: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { label: 'Categories', to: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
    { label: 'Collections', to: '/admin/collections', icon: <Sliders className="w-4 h-4" /> },
    { label: 'Orders', to: '/admin/orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Customers', to: '/admin/customers', icon: <Users className="w-4 h-4" /> },
    { label: 'Reviews', to: '/admin/reviews', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Inquiries', to: '/admin/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Subscribers', to: '/admin/subscribers', icon: <Users className="w-4 h-4" /> },
    { label: 'Coupons', to: '/admin/coupons', icon: <Tag className="w-4 h-4" /> },
    { label: 'Homepage CMS', to: '/admin/homepage', icon: <Sliders className="w-4 h-4" /> },
    { label: 'Media Library', to: '/admin/media', icon: <Image className="w-4 h-4" /> },
    { label: 'Export Catalog', to: '/admin/catalog', icon: <FileText className="w-4 h-4" /> },
    { label: 'Shipping', to: '/admin/shipping', icon: <Truck className="w-4 h-4" /> },
    { label: 'Payments', to: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Analytics', to: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Settings', to: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  if (loading) {
    return <div className="min-h-screen bg-slate-900 p-8 text-sm text-slate-300">Checking admin session...</div>;
  }

  if (!admin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
              JAB LEATHER
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-sm border border-amber-500/30">
              Admin Ops
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-200 block">
                {admin?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-500">Sialkot HQ Desk</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 transition"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-20 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 pt-16 lg:pt-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
            <p>JAB Leather v1.0 Ops</p>
            <p className="text-[10px] text-slate-600">Supabase Auth • Admin role required</p>
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
