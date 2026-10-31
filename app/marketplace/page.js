'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { ProfitMarginMeter } from '../../components/shared/Charts';
import { productService } from '../../services/agentService';
import { negotiationService } from '../../services/negotiationService';
import { useUI } from '../../context/UIContext';
import { formatINR } from '../../utils/formatters';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Filter,
  Play,
  CheckCircle,
  Eye,
  TrendingUp,
  Clock,
  Package,
  Boxes,
} from 'lucide-react';

export default function MarketplacePage() {
  const router = useRouter();
  const { showToast } = useUI();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Quick RFQ Launch Modal State
  const [selectedProductForRfq, setSelectedProductForRfq] = useState(null);
  const [targetQuantity, setTargetQuantity] = useState(12);
  const [targetBudget, setTargetBudget] = useState(50000);
  const [launchingRfq, setLaunchingRfq] = useState(false);

  // Inspect SKU Modal State
  const [inspectProduct, setInspectProduct] = useState(null);

  const CATEGORIES = ['ALL', 'Electronics', 'Warehouse', 'Safety', 'Office', 'Retail-POS'];

  useEffect(() => {
    let mounted = true;
    productService
      .getAll()
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
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenRfq = (product) => {
    setSelectedProductForRfq(product);
    setTargetQuantity(12);
    setTargetBudget(Math.min(50000, product.baseCostPrice * 12 * 1.1));
  };

  const handleExecuteRfq = async (e) => {
    e.preventDefault();
    if (!selectedProductForRfq) return;
    setLaunchingRfq(true);

    try {
      await negotiationService.create({
        targetProductId: selectedProductForRfq.id,
        targetQuantity: Number(targetQuantity),
        maxBudget: Number(targetBudget),
        maxDeliveryHours: selectedProductForRfq.typicalLeadTimeHours || 48,
        targetResaleMargin: 25,
      });

      showToast(`Autonomous RFQ initiated for ${selectedProductForRfq.name}!`, 'success');
      setSelectedProductForRfq(null);
      router.push('/negotiation');
    } catch {
      showToast('Initiated simulated session.', 'info');
      setSelectedProductForRfq(null);
      router.push('/negotiation');
    } finally {
      setLaunchingRfq(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-400 shrink-0" /> B2B Marketplace Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            40 wholesale enterprise SKUs ready for multi-agent procurement within the ₹50,000 budget cap.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          Showing <span className="text-indigo-400 font-bold">{filteredProducts.length}</span> of 40 SKUs
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold shadow-indigo-500/20 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SKU or product title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const margin = product.targetSellingPrice > 0
            ? (((product.targetSellingPrice - product.baseCostPrice) / product.targetSellingPrice) * 100).toFixed(1)
            : '25.0';

          return (
            <Card
              key={product.id || product.sku}
              className="flex flex-col justify-between hover:border-slate-700/80 transition-all"
            >
              <div>
                {/* SKU + Category */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-indigo-400 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 font-bold">
                    {product.sku}
                  </span>
                  <span className="text-[11px] text-slate-400">{product.category}</span>
                </div>

                <h3 className="font-semibold text-sm text-slate-100 line-clamp-1">{product.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {product.description || 'Enterprise grade wholesale procurement item.'}
                </p>

                {/* Price & Margin Matrix */}
                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Wholesale Base</span>
                    <span className="font-mono text-slate-200 font-medium">
                      {formatINR(product.baseCostPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Target Selling</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {formatINR(product.targetSellingPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">In Stock</span>
                    <span className="text-slate-300 font-mono">{product.stockQuantity || 120} units</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Projected Margin</span>
                    <span className="text-indigo-400 font-mono font-bold">{margin}%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInspectProduct(product)}
                  className="gap-1 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenRfq(product)}
                  className="w-full gap-1.5 text-xs"
                >
                  <Play className="w-3.5 h-3.5" /> Launch RFQ
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Inspect SKU Details Modal */}
      <Modal
        isOpen={Boolean(inspectProduct)}
        onClose={() => setInspectProduct(null)}
        title={inspectProduct?.name || 'Product Specifications'}
        subtitle={`SKU: ${inspectProduct?.sku} | Category: ${inspectProduct?.category}`}
      >
        {inspectProduct && (
          <div className="space-y-4 text-xs text-slate-300">
            <p className="leading-relaxed text-slate-300">{inspectProduct.description}</p>

            <ProfitMarginMeter
              costPrice={inspectProduct.baseCostPrice}
              sellingPrice={inspectProduct.targetSellingPrice}
            />

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 block">Quality Classification:</span>
                <span className="text-slate-200">{inspectProduct.qualityGrade || 'Enterprise'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Typical Dispatch Lead Time:</span>
                <span className="text-slate-200">{inspectProduct.typicalLeadTimeHours || 24} Hours</span>
              </div>
              <div>
                <span className="text-slate-500 block">Warehouse Available Stock:</span>
                <span className="text-slate-200">{inspectProduct.stockQuantity || 100} units</span>
              </div>
              <div>
                <span className="text-slate-500 block">Warranty Period:</span>
                <span className="text-slate-200">{inspectProduct.warrantyMonths || 24} Months</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setInspectProduct(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const prod = inspectProduct;
                  setInspectProduct(null);
                  handleOpenRfq(prod);
                }}
                className="gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> Start Negotiation
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Launch Autonomous RFQ Modal */}
      <Modal
        isOpen={Boolean(selectedProductForRfq)}
        onClose={() => setSelectedProductForRfq(null)}
        title="Launch Autonomous RFQ Session"
        subtitle={`Product: ${selectedProductForRfq?.name}`}
      >
        {selectedProductForRfq && (
          <form onSubmit={handleExecuteRfq} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Selected SKU</span>
                <span className="font-mono font-bold text-indigo-400">{selectedProductForRfq.sku}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Wholesale Unit Cost</span>
                <span className="font-mono text-emerald-400 font-bold">{formatINR(selectedProductForRfq.baseCostPrice)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Budget Ceiling (INR)</label>
                <input
                  type="number"
                  max="50000"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500">Max limit: ₹50,000</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-[11px] text-slate-300 leading-relaxed">
              <strong>Autonomous Multi-Agent Handshake:</strong> Upon broadcast, Buyer Agent will solicit bids simultaneously from Seller A (Wholesale Price), Seller B (Express SLA), and scan Seller C through Zero-Trust filters.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedProductForRfq(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={launchingRfq} className="gap-1.5">
                <Play className="w-3.5 h-3.5" /> Initialize Negotiation Room
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
