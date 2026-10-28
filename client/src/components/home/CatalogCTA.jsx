import React from 'react';
import { Download, FileText, ArrowRight } from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';

export const CatalogCTA = () => {
  const toast = useToast();
  const catalog = catalogService.getCatalogDetails();

  const handleDownload = (e) => {
    e.preventDefault();
    toast.success('Official JAB Leather Catalog 2026 download started (development placeholder)');
  };

  const handleView = (e) => {
    e.preventDefault();
    toast.info('Viewing JAB Leather Digital Catalog viewer (development placeholder)');
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#F7F5F0] rounded-xs border border-[#DDD8D0] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xs bg-[#171717] text-white flex items-center justify-center shrink-0 shadow-sm">
            <FileText className="w-6 h-6 text-[#A66A3F]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A66A3F] block mb-1">
              {catalog.edition}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#171717]">
              Explore Our Leather Catalog
            </h3>
            <p className="text-xs sm:text-sm text-[#6B665F] mt-1 max-w-xl">
              Discover our latest leather jackets, bags, vests, accessories, and custom leather products. Includes detailed leather grade specifications and wholesale ordering parameters ({catalog.fileSize} PDF).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={handleView}
            className="flex-1 sm:flex-initial gap-2"
          >
            <span>View Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleDownload}
            className="flex-1 sm:flex-initial gap-2 font-bold"
          >
            <Download className="w-4 h-4" />
            <span>Download Catalog</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CatalogCTA;
