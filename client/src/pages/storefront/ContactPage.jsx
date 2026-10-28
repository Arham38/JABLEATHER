import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { messagingService } from '../../services/messagingService';
import { useToast } from '../../context/ToastContext';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const ContactPage = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'General Inquiry',
    company: '',
    phone: '',
    message: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in your name, email, and message');
      return;
    }

    setIsSubmitting(true);
    try {
      await messagingService.submitContactMessage({
        name: formData.name,
        email: formData.email,
        subject: `[${formData.inquiryType}] ${formData.company ? `(${formData.company})` : ''}`,
        message: formData.message,
        phone: formData.phone,
        honeypot,
      });
      setIsSent(true);
      toast.success('Your message has been received! Our export desk will reply within 24 hours.');
    } catch (err) {
      toast.error(err.message || 'Could not send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Contact & Wholesale Inquiries' }]} />

      {/* Page Title */}
      <div className="py-8 border-b border-[#DDD8D0] mb-12">
        <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-1">
          Direct Communication
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
          Contact JAB Leather
        </h1>
        <p className="text-xs sm:text-sm text-[#6B665F] mt-2 max-w-xl">
          Whether you have an inquiry regarding custom sizing, private-label manufacturing, or retail orders, our Sialkot office is ready to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-8 rounded-xs border border-[#DDD8D0]">
          <h2 className="text-lg font-bold text-[#171717] mb-6">
            Send Us a Message
          </h2>

          {isSent ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-xs text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-900">Message Dispatched</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Thank you, {formData.name}. Your inquiry has been sent directly to the JAB Leather export desk in Sialkot.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSent(false);
                  setFormData({
                    name: '',
                    email: '',
                    inquiryType: 'General Inquiry',
                    company: '',
                    phone: '',
                    message: '',
                  });
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Anti-spam honeypot */}
              <input
                type="text"
                name="b_website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Liam Vance"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. liam@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#1C1C1C] mb-1.5">
                    Inquiry Type
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full min-h-[44px] px-3 py-2 text-xs bg-white border border-[#DDD8D0] rounded-xs text-[#1C1C1C]"
                  >
                    <option value="General Inquiry">General Product Inquiry</option>
                    <option value="Wholesale Order">B2B Wholesale / Bulk Export</option>
                    <option value="Custom OEM">Custom Private-Label Design (OEM)</option>
                    <option value="Sizing Advice">Custom Sizing / Made to Measure</option>
                    <option value="Order Status">Existing Order Status</option>
                  </select>
                </div>
                <Input
                  label="Company / Brand Name (Optional)"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Vance Apparel Ltd"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#1C1C1C] mb-1.5">
                  Message / Specifications
                </label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail your requirements, desired quantity, leather preference, or questions..."
                  className="w-full text-xs p-3 border border-[#DDD8D0] rounded-xs focus:outline-none focus:border-[#171717]"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="gap-2 font-bold px-8"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </Button>
            </form>
          )}
        </div>

        {/* Right Column: Sialkot Office & Factory Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#171717] text-white p-8 rounded-xs border border-stone-800 space-y-6">
            <h3 className="text-base font-bold uppercase tracking-wider text-white pb-3 border-b border-stone-800">
              Factory & Export Desk
            </h3>

            <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#A66A3F] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">Atelier Address</strong>
                  <span>Georgia 30176, USA • Export Processing Zone, Sialkot, Punjab, Pakistan</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#A66A3F] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">Email</strong>
                  <a href="mailto:jazibalisher@gmail.com" className="hover:text-white transition">
                    jazibalisher@gmail.com
                  </a>
                  <span className="block text-[11px] text-stone-400">Wholesale: export@jableather.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#A66A3F] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">Telephone</strong>
                  <span>+1 (929) 409-9845 (Mon–Sat, 9AM–6PM EST)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-[#A66A3F] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">WhatsApp Direct</strong>
                  <a
                    href="https://wa.me/19294099845"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#A66A3F] hover:underline font-semibold"
                  >
                    +1 (929) 409-9845 (Instant Chat)
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Policies Accordion Box */}
          <div className="bg-white p-6 rounded-xs border border-[#DDD8D0] space-y-4 text-xs text-[#1C1C1C]">
            <h4 className="font-bold text-sm text-[#171717]">Frequently Asked Questions</h4>
            <div className="space-y-2">
              <p className="font-semibold text-stone-900">What are your minimum order quantities (MOQs)?</p>
              <p className="text-[#6B665F]">
                For retail items on this website, MOQ is 1 piece. For custom private-label bulk manufacturing, our minimum order quantity starts at 20 pieces per style.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <p className="font-semibold text-stone-900">Can I request a sample jacket before ordering wholesale?</p>
              <p className="text-[#6B665F]">
                Yes, sample prototyping is a core part of our OEM process. Tech-pack samples typically ship within 7–10 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
