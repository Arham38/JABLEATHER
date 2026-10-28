import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageSquare, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#171717] text-[#DDD8D0] pt-16 pb-24 lg:pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                JAB LEATHER
              </span>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#A66A3F] font-bold mt-0.5">
                Leather Manufacturer & Exporter
              </p>
            </Link>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Handcrafted genuine leather outerwear, duffels, and bespoke accessories tailored in Sialkot, Pakistan. Engineered with precision craftsmanship for global delivery.
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#A66A3F] shrink-0" />
                <span>Georgia 30176, USA • Export Processing Zone, Sialkot, Punjab, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#A66A3F] shrink-0" />
                <a href="mailto:jazibalisher@gmail.com" className="hover:text-white transition">
                  jazibalisher@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#A66A3F] shrink-0" />
                <a href="tel:+19294099845" className="hover:text-white transition">
                  +1 (929) 409-9845
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#A66A3F] shrink-0" />
                <a
                  href="https://wa.me/19294099845"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  <span>WhatsApp Business: +1 (929) 409-9845</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-white mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/category/biker-jackets" className="hover:text-white transition">
                  Men's Jackets
                </Link>
              </li>
              <li>
                <Link to="/category/womens-jackets" className="hover:text-white transition">
                  Women's Jackets
                </Link>
              </li>
              <li>
                <Link to="/best-sellers" className="hover:text-white transition">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="hover:text-white transition">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-white mb-4">
              Information
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/contact#size-guide" className="hover:text-white transition">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/contact#shipping" className="hover:text-white transition">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/contact#returns" className="hover:text-white transition">
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link to="/contact#faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Wholesale Column */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-white mb-4">
              B2B & Manufacturing
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/collections/custom-collection" className="hover:text-white transition">
                  Wholesale Inquiries
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Custom Orders
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  Private Label (OEM)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-stone-500 hover:text-stone-300 transition text-xs pt-3 block">
                  Staff Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Strip */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} JAB Leather. All rights reserved. Sialkot, Pakistan.</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/contact" className="hover:text-stone-300 transition">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-stone-300 transition">Terms & Conditions</Link>
            <Link to="/contact" className="hover:text-stone-300 transition">Shipping Policy</Link>
            <Link to="/contact" className="hover:text-stone-300 transition">Return Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
