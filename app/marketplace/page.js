'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { productService } from '../../services/agentService';
import { formatINR } from '../../utils/formatters';
import Link from 'next/link';
import { ShoppingBag, Search, Filter, Play, CheckCircle } from 'lucide-react';

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const CATEGORIES = ['ALL', 'Electronics', 'Warehouse', 'Safety', 'Office', 'Retail-POS'];

  useEffect(() => {
    let mounted = true;
    productService.getAll()
      .then((res) => {
        if (mounted && res?.data?.products) {
          setProducts(res.data.products);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-400" /> B2B Marketplace Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            40 wholesale enterprise SKUs ready for multi-agent procurement within the ₹50,000 budget cap.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SKU or product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id || product.sku} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  {product.sku}
                </span>
                <span className="text-[11px] text-slate-400">{product.category}</span>
              </div>
              <h3 className="font-semibold text-sm text-slate-100 line-clamp-1">{product.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {product.description || 'Enterprise grade bulk procurement item.'}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Base Unit Cost</span>
                  <span className="font-mono text-slate-200">{formatINR(product.baseCostPrice)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Target Selling</span>
                  <span className="font-mono text-emerald-400 font-semibold">{formatINR(product.targetSellingPrice)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">In Stock</span>
                  <span className="text-slate-300 font-mono">{product.stockQuantity || 120} units</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Standard SLA</span>
                  <span className="text-slate-300">{product.typicalLeadTimeHours || 24} Hours</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <Link href="/negotiation">
                <Button variant="primary" size="sm" className="w-full gap-2 text-xs">
                  <Play className="w-3.5 h-3.5" /> Launch Autonomous Negotiation
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

