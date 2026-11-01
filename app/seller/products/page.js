'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { sellerService } from '../../../services/sellerService';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Clock,
  IndianRupee,
  Boxes,
  Truck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  FileText,
  BadgeCheck,
  Eye,
  Store,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Networking',
  'Hardware',
  'Office Supplies',
  'Industrial',
  'Safety & Security',
  'Retail & POS',
];

const QUALITY_GRADES = ['Standard', 'Enterprise', 'Enterprise-Plus', 'Certified OEM'];

const DEFAULT_FORM = {
  name: '',
  sku: '',
  category: 'Electronics',
  description: '',
  imageUrl: '',
  unit: 'Unit',
  targetSellingPrice: '',
  minSellingPrice: '',
  baseCostPrice: '',
  stockQuantity: '',
  minOrderQty: 1,
  maxOrderQty: '',
  warehouseLocation: 'Main Central Hub - Mumbai',
  typicalLeadTimeHours: 24,
  qualityGrade: 'Enterprise',
  certifications: '',
  warrantyPeriod: '12 Months Replacement',
  specifications: '',
  features: '',
};

export default function SellerProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isSeller, isLoading: authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch Seller Products
  const fetchProducts = async () => {
    try {
      setError(null);
      const res = await sellerService.getInventory();
      if (res?.data && Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load seller catalogue:', err);
      setError(err?.message || 'Could not load your product catalogue.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && isSeller) {
        fetchProducts();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, isSeller]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // Open Add Product Modal
  const handleOpenAdd = () => {
    setEditingId(null);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      ...DEFAULT_FORM,
      sku: `SKU-${randomSuffix}`,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setFormData({
      name: p.name || '',
      sku: p.sku || '',
      category: p.category || 'Electronics',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      unit: p.unit || 'Unit',
      targetSellingPrice: p.targetSellingPrice ? String(p.targetSellingPrice) : '',
      minSellingPrice: p.minSellingPrice ? String(p.minSellingPrice) : '',
      baseCostPrice: p.baseCostPrice ? String(p.baseCostPrice) : '',
      stockQuantity: p.inventory?.stockQuantity !== undefined ? String(p.inventory.stockQuantity) : '0',
      minOrderQty: p.minOrderQty || 1,
      maxOrderQty: p.maxOrderQty || '',
      warehouseLocation: p.inventory?.warehouseLocation || 'Main Central Hub - Mumbai',
      typicalLeadTimeHours: p.typicalLeadTimeHours || 24,
      qualityGrade: p.qualityGrade || 'Enterprise',
      certifications: p.certifications || '',
      warrantyPeriod: p.warrantyPeriod || '12 Months Replacement',
      specifications: p.specifications || '',
      features: p.features || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Auto Generate SKU
  const handleGenerateSku = () => {
    const catCode = (formData.category || 'PROD').slice(0, 3).toUpperCase();
    const rand = Math.floor(100000 + Math.random() * 900000);
    setFormData((prev) => ({ ...prev, sku: `${catCode}-${rand}` }));
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.sku.trim()) errors.sku = 'Product SKU is required';
    if (!formData.category.trim()) errors.category = 'Category is required';

    const target = parseFloat(formData.targetSellingPrice);
    const minSell = parseFloat(formData.minSellingPrice);

    if (isNaN(target) || target <= 0) {
      errors.targetSellingPrice = 'Enter a valid wholesale target price (> ₹0)';
    }
    if (isNaN(minSell) || minSell <= 0) {
      errors.minSellingPrice = 'Enter a valid floor price (> ₹0)';
    } else if (!isNaN(target) && minSell > target) {
      errors.minSellingPrice = 'Minimum floor price cannot exceed wholesale quote price';
    }

    const stock = parseInt(formData.stockQuantity, 10);
    if (isNaN(stock) || stock < 0) {
      errors.stockQuantity = 'Enter a valid stock quantity (0 or more)';
    }

    const leadTime = parseInt(formData.typicalLeadTimeHours, 10);
    if (isNaN(leadTime) || leadTime <= 0) {
      errors.typicalLeadTimeHours = 'Enter valid delivery SLA turnaround hours';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add or Edit Product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setFeedback(null);

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      category: formData.category,
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim() || null,
      unit: formData.unit,
      targetSellingPrice: parseFloat(formData.targetSellingPrice),
      minSellingPrice: parseFloat(formData.minSellingPrice),
      baseCostPrice: formData.baseCostPrice ? parseFloat(formData.baseCostPrice) : undefined,
      stockQuantity: parseInt(formData.stockQuantity, 10),
      minOrderQty: parseInt(formData.minOrderQty, 10) || 1,
      maxOrderQty: formData.maxOrderQty ? parseInt(formData.maxOrderQty, 10) : null,
      warehouseLocation: formData.warehouseLocation,
      typicalLeadTimeHours: parseInt(formData.typicalLeadTimeHours, 10),
      qualityGrade: formData.qualityGrade,
      certifications: formData.certifications.trim(),
      warrantyPeriod: formData.warrantyPeriod.trim(),
      specifications: formData.specifications.trim(),
      features: formData.features.trim(),
    };

    try {
      if (editingId) {
        await sellerService.updateProductPricing(editingId, payload);
        setFeedback({ type: 'success', message: 'Product updated successfully in your catalogue!' });
      } else {
        await sellerService.createProduct(payload);
        setFeedback({ type: 'success', message: 'Product added successfully to your catalogue!' });
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to save product. Please check fields.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete
  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await sellerService.deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      alert(err?.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'All Categories' ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();

    const stock = p.inventory?.stockQuantity ?? 0;
    let matchesStatus = true;
    if (statusFilter === 'IN_STOCK') matchesStatus = stock > 10;
    else if (statusFilter === 'LOW_STOCK') matchesStatus = stock > 0 && stock <= 10;
    else if (statusFilter === 'OUT_OF_STOCK') matchesStatus = stock === 0;

    return matchesSearch && matchesCat && matchesStatus;
  });

  // Calculate Metrics
  const totalSkus = products.length;
  const totalUnits = products.reduce((acc, p) => acc + Number(p.inventory?.stockQuantity || 0), 0);
  const totalValue = products.reduce(
    (acc, p) => acc + Number(p.targetSellingPrice || 0) * Number(p.inventory?.stockQuantity || 0),
    0
  );
  const avgSla = totalSkus > 0
    ? Math.round(products.reduce((acc, p) => acc + Number(p.typicalLeadTimeHours || 24), 0) / totalSkus)
    : 24;

  // Auth Guard: Unauthenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-[#fffdf9] rounded-2xl border border-[#1e3a8a]/20">
        <div className="w-16 h-16 rounded-2xl bg-[#f4efe3] border border-[#1e3a8a]/20 flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-[#1d4ed8]" />
        </div>
        <h2 className="text-xl font-bold text-[#172554] mb-2">Seller Authentication Required</h2>
        <p className="text-sm text-[#1e3a8a] max-w-md mb-6">
          You must be logged into an authorized Supplier account to access the product catalogue management module.
        </p>
        <button
          onClick={() => router.push('/login?portal=SELLER')}
          className="px-6 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] font-semibold text-sm flex items-center gap-2 transition-all shadow-xs"
        >
          <span>Go to Seller Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Auth Guard: Logged in as Buyer
  if (!authLoading && isAuthenticated && !isSeller) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-[#fffdf9] rounded-2xl border border-[#1e3a8a]/20">
        <div className="w-16 h-16 rounded-2xl bg-[#f4efe3] border border-[#1e3a8a]/20 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-[#1d4ed8]" />
        </div>
        <h2 className="text-xl font-bold text-[#172554] mb-2">Enterprise Buyer Session Active</h2>
        <p className="text-sm text-[#1e3a8a] max-w-md mb-6">
          You are currently signed in under an Enterprise Buyer account. Product catalogue publishing is restricted to verified suppliers.
        </p>
        <button
          onClick={() => router.push('/marketplace')}
          className="px-6 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] font-semibold text-sm flex items-center gap-2 transition-all shadow-xs"
        >
          <span>Browse Procurement Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#172554]">
      {/* Top Header Card */}
      <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1">
                <Package className="w-3 h-3" />
                Supplier Product Catalogue
              </span>
              <span className="text-xs text-[#1e3a8a] font-mono">
                {user?.businessId ? `ID: ${user.businessId.slice(0, 8)}...` : 'Verified Catalogue'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172554]">
              Product Catalogue & Margin Guardrails
            </h1>
            <p className="text-xs sm:text-sm text-[#1e3a8a] mt-1 max-w-2xl">
              Publish wholesale SKUs, define quality grades, SLA delivery turnaround times, and set minimum floor price guardrails for autonomous agent negotiation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] border border-[#1e3a8a]/20 transition-all shadow-xs disabled:opacity-50"
              title="Refresh catalogue"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] font-semibold text-sm flex items-center gap-2 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-[#f4efe3] text-[#172554] border-[#1e3a8a]/30'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#1d4ed8]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-gray-500 hover:text-gray-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#1e3a8a] mb-1">
            <span>Active SKUs</span>
            <Package className="w-4 h-4 text-[#1d4ed8]" />
          </div>
          <div className="text-2xl font-bold text-[#172554]">{totalSkus}</div>
          <div className="text-[11px] text-[#1e3a8a] mt-0.5">Real catalog items in DB</div>
        </div>

        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#1e3a8a] mb-1">
            <span>Warehouse Units</span>
            <Boxes className="w-4 h-4 text-[#1d4ed8]" />
          </div>
          <div className="text-2xl font-bold text-[#172554]">{totalUnits.toLocaleString()}</div>
          <div className="text-[11px] text-[#1e3a8a] mt-0.5">Available for bidding</div>
        </div>

        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#1e3a8a] mb-1">
            <span>Catalogue Valuation</span>
            <IndianRupee className="w-4 h-4 text-[#1d4ed8]" />
          </div>
          <div className="text-2xl font-bold text-[#172554]">₹{totalValue.toLocaleString()}</div>
          <div className="text-[11px] text-[#1e3a8a] mt-0.5">Wholesale inventory value</div>
        </div>

        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#1e3a8a] mb-1">
            <span>Avg Fulfillment SLA</span>
            <Clock className="w-4 h-4 text-[#1d4ed8]" />
          </div>
          <div className="text-2xl font-bold text-[#172554]">{avgSla}h</div>
          <div className="text-[11px] text-[#1e3a8a] mt-0.5">Guaranteed dispatch turnaround</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1e3a8a]/60" />
            <input
              type="text"
              placeholder="Search by SKU, product name, or specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-xs text-[#172554] placeholder-[#1e3a8a]/50 focus:outline-hidden focus:border-[#1d4ed8]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-xs text-[#172554] font-medium focus:outline-hidden focus:border-[#1d4ed8]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-xs text-[#172554] font-medium focus:outline-hidden focus:border-[#1d4ed8]"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock (&gt;10)</option>
              <option value="LOW_STOCK">Low Stock (1-10)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalogue Content */}
      {loading ? (
        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-12 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#1d4ed8] animate-spin mx-auto mb-3" />
          <h3 className="font-bold text-[#172554]">Loading Product Catalogue...</h3>
          <p className="text-xs text-[#1e3a8a] mt-1">Connecting to PostgreSQL inventory records</p>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#f4efe3] border border-[#1e3a8a]/20 flex items-center justify-center mx-auto mb-4">
            <Boxes className="w-8 h-8 text-[#1d4ed8]" />
          </div>
          <h2 className="text-xl font-bold text-[#172554] mb-2">Your Product Catalogue is Empty</h2>
          <p className="text-sm text-[#1e3a8a] max-w-md mx-auto mb-6">
            You haven&apos;t added any products to your catalogue yet. Your autonomous seller agent can only bid and submit quotations on real products registered in your catalogue.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-6 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] font-semibold text-sm inline-flex items-center gap-2 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Product</span>
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* No Search Match State */
        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-10 text-center shadow-xs">
          <Package className="w-10 h-10 text-[#1e3a8a]/50 mx-auto mb-3" />
          <h3 className="font-bold text-[#172554]">No Products Match Your Filter</h3>
          <p className="text-xs text-[#1e3a8a] mt-1">Try adjusting your search query or category filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Categories');
              setStatusFilter('ALL');
            }}
            className="mt-4 px-4 py-1.5 rounded-lg bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] text-xs font-semibold border border-[#1e3a8a]/20"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Product Grid / Table */
        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e3a8a]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#172554]">Active Catalogue SKUs</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#f4efe3] text-[#1d4ed8] text-[10px] font-bold">
                {filteredProducts.length} of {products.length}
              </span>
            </div>
            <span className="text-[11px] text-[#1e3a8a]">
              SLA Delivery & Price Floor Guardrails Enforced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf7ee] text-[#1e3a8a] uppercase text-[10px] tracking-wider font-semibold border-b border-[#1e3a8a]/15">
                <tr>
                  <th className="py-3 px-4">Product & SKU</th>
                  <th className="py-3 px-4">Category & QA</th>
                  <th className="py-3 px-4">Wholesale / Floor Price</th>
                  <th className="py-3 px-4">Stock & Warehouse</th>
                  <th className="py-3 px-4">SLA & Warranty</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3a8a]/10">
                {filteredProducts.map((p) => {
                  const stock = p.inventory?.stockQuantity ?? 0;
                  const reserved = p.inventory?.reservedQuantity ?? 0;
                  const isLow = stock <= 10 && stock > 0;
                  const isOut = stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#faf7ee]/70 transition-colors">
                      {/* Product Name & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#172554] text-sm">{p.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 font-bold">
                            {p.sku}
                          </span>
                          <span className="text-[10px] text-[#1e3a8a]">{p.unit || 'Unit'}</span>
                        </div>
                        {p.description && (
                          <p className="text-[11px] text-[#1e3a8a] mt-1 line-clamp-1 max-w-xs">
                            {p.description}
                          </p>
                        )}
                      </td>

                      {/* Category & Quality Grade */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#172554]">{p.category}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-[#f4efe3] text-[#172554] border border-[#1e3a8a]/20 text-[10px] font-semibold flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3 text-[#1d4ed8]" />
                            {p.qualityGrade || 'Enterprise'}
                          </span>
                        </div>
                      </td>

                      {/* Pricing & Floor Price */}
                      <td className="py-3.5 px-4">
                        <div className="text-sm font-extrabold text-[#172554]">
                          ₹{Number(p.targetSellingPrice).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[#1e3a8a]">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Floor: ₹{Number(p.minSellingPrice).toLocaleString()}</span>
                        </div>
                        {p.baseCostPrice && (
                          <div className="text-[10px] text-[#1e3a8a]/70">
                            Cost: ₹{Number(p.baseCostPrice).toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Stock & Warehouse */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#172554]">{stock}</span>
                          {isOut ? (
                            <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              In Stock
                            </span>
                          )}
                        </div>
                        {reserved > 0 && (
                          <div className="text-[10px] text-[#1e3a8a] mt-0.5">
                            Reserved: {reserved} units
                          </div>
                        )}
                        <div className="text-[10px] text-[#1e3a8a] mt-0.5 flex items-center gap-1">
                          <Truck className="w-2.5 h-2.5 text-[#1e3a8a]" />
                          <span>{p.inventory?.warehouseLocation || 'Mumbai Hub'}</span>
                        </div>
                      </td>

                      {/* SLA & Warranty */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-[#172554] font-semibold text-xs">
                          <Clock className="w-3 h-3 text-[#1d4ed8]" />
                          <span>{p.typicalLeadTimeHours || 24}h Turnaround</span>
                        </div>
                        <div className="text-[10px] text-[#1e3a8a] mt-0.5">
                          {p.warrantyPeriod || '12 Months Replacement'}
                        </div>
                        {p.certifications && (
                          <div className="text-[10px] text-[#1e3a8a] mt-0.5 truncate max-w-[140px]" title={p.certifications}>
                            Cert: {p.certifications}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] border border-[#1e3a8a]/20 transition-all shadow-xs"
                            title="Edit product & pricing"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all shadow-xs"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#172554]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#fffdf9] px-6 py-4 border-b border-[#1e3a8a]/20 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#f4efe3] border border-[#1e3a8a]/20 flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#1d4ed8]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#172554] text-base">
                    {editingId ? 'Edit Product & Pricing' : 'Add New Product to Catalogue'}
                  </h3>
                  <p className="text-[11px] text-[#1e3a8a]">
                    Configure real inventory specs and autonomous bidding limits
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#f4efe3] text-[#1e3a8a]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
              {/* Section 1: Basic Information */}
              <div>
                <h4 className="font-bold text-[#172554] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1d4ed8]"></span>
                  1. Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-[#172554] font-semibold mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise Wi-Fi 6 Mesh Router"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl bg-[#faf7ee] border text-[#172554] focus:outline-hidden ${
                        formErrors.name ? 'border-red-500' : 'border-[#1e3a8a]/20 focus:border-[#1d4ed8]'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-[10px] mt-0.5">{formErrors.name}</p>
                    )}
                  </div>

                  {/* SKU */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#172554] font-semibold">
                        Product SKU <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateSku}
                        className="text-[10px] text-[#1d4ed8] hover:underline font-semibold"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. ELEC-RT-001"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl bg-[#faf7ee] border font-mono text-[#172554] focus:outline-hidden ${
                        formErrors.sku ? 'border-red-500' : 'border-[#1e3a8a]/20 focus:border-[#1d4ed8]'
                      }`}
                    />
                    {formErrors.sku && (
                      <p className="text-red-500 text-[10px] mt-0.5">{formErrors.sku}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] font-medium focus:outline-hidden focus:border-[#1d4ed8]"
                    >
                      {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unit of Measurement */}
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Unit of Measurement
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] font-medium focus:outline-hidden focus:border-[#1d4ed8]"
                    >
                      <option value="Unit">Unit (Piece)</option>
                      <option value="Pack">Pack (Multi-item)</option>
                      <option value="Box">Box (Wholesale Box)</option>
                      <option value="Carton">Carton</option>
                      <option value="Set">Set</option>
                    </select>
                  </div>

                  {/* Image URL (optional) */}
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Product Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/product.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] focus:outline-hidden focus:border-[#1d4ed8]"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-[#172554] font-semibold mb-1">
                      Product Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Provide detailed description and wholesale supply terms..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] focus:outline-hidden focus:border-[#1d4ed8]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing & Floor Margins */}
              <div className="pt-2 border-t border-[#1e3a8a]/15">
                <h4 className="font-bold text-[#172554] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1d4ed8]"></span>
                  2. Pricing & Autonomous Agent Floor Margin
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Unit Wholesale Price */}
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Unit Wholesale Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="4200"
                      value={formData.targetSellingPrice}
                      onChange={(e) => setFormData({ ...formData, targetSellingPrice: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl bg-[#faf7ee] border text-[#172554] font-semibold focus:outline-hidden ${
                        formErrors.targetSellingPrice ? 'border-red-500' : 'border-[#1e3a8a]/20 focus:border-[#1d4ed8]'
                      }`}
                    />
                    <p className="text-[10px] text-[#1e3a8a] mt-0.5">Initial quote target</p>
                    {formErrors.targetSellingPrice && (
                      <p className="text-red-500 text-[10px] mt-0.5">{formErrors.targetSellingPrice}</p>
                    )}
                  </div>

                  {/* Minimum Selling Floor Price */}
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Minimum Floor Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="3500"
                      value={formData.minSellingPrice}
                      onChange={(e) => setFormData({ ...formData, minSellingPrice: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl bg-[#faf7ee] border text-[#172554] font-semibold focus:outline-hidden ${
                        formErrors.minSellingPrice ? 'border-red-500' : 'border-[#1e3a8a]/20 focus:border-[#1d4ed8]'
                      }`}
                    />
                    <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                      Agent will NEVER go below this
                    </p>
                    {formErrors.minSellingPrice && (
                      <p className="text-red-500 text-[10px] mt-0.5">{formErrors.minSellingPrice}</p>
                    )}
                  </div>

                  {/* Base Cost Price */}
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Internal Cost Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="3200"
                      value={formData.baseCostPrice}
                      onChange={(e) => setFormData({ ...formData, baseCostPrice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] focus:outline-hidden focus:border-[#1d4ed8]"
                    />
                    <p className="text-[10px] text-[#1e3a8a] mt-0.5">For margin calculation</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Inventory & Warehouse */}
              <div className="pt-2 border-t border-[#1e3a8a]/15">
                <h4 className="font-bold text-[#172554] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1d4ed8]"></span>
                  3. Inventory & Order Quantities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Available Stock (Units) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="100"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl bg-[#faf7ee] border text-[#172554] font-semibold focus:outline-hidden ${
                        formErrors.stockQuantity ? 'border-red-500' : 'border-[#1e3a8a]/20 focus:border-[#1d4ed8]'
                      }`}
                    />
                    {formErrors.stockQuantity && (
                      <p className="text-red-500 text-[10px] mt-0.5">{formErrors.stockQuantity}</p>
                    )}
                  </div>

                  {/* MOQ */}
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Min Order Qty (MOQ)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={formData.minOrderQty}
                      onChange={(e) => setFormData({ ...formData, minOrderQty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] focus:outline-hidden focus:border-[#1d4ed8]"
                    />
                  </div>

                  {/* Warehouse Location */}
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Warehouse Location
                    </label>
                    <input
                      type="text"
                      placeholder="Main Central Hub - Mumbai"
                      value={formData.warehouseLocation}
                      onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] focus:outline-hidden focus:border-[#1d4ed8]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Delivery, Quality & Warranty */}
              <div className="pt-2 border-t border-[#1e3a8a]/15">
                <h4 className="font-bold text-[#172554] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1d4ed8]"></span>
                  4. Delivery SLA & Quality Certifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* SLA Hours */}
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Fulfillment SLA (Hours) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="24"
                      value={formData.typicalLeadTimeHours}
                      onChange={(e) => setFormData({ ...formData, typicalLeadTimeHours: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] font-semibold focus:outline-hidden focus:border-[#1d4ed8]"
                    />
                    <p className="text-[10px] text-[#1e3a8a] mt-0.5">Turnaround commitment</p>
                  </div>

                  {/* Quality Grade */}
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Quality Grade
                    </label>
                    <select
                      value={formData.qualityGrade}
                      onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] font-medium focus:outline-hidden focus:border-[#1d4ed8]"
                    >
                      {QUALITY_GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Warranty Period */}
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Warranty Period
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 24 Months Replacement"
                      value={formData.warrantyPeriod}
                      onChange={(e) => setFormData({ ...formData, warrantyPeriod: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] focus:outline-hidden focus:border-[#1d4ed8]"
                    />
                  </div>

                  {/* Certifications */}
                  <div className="md:col-span-3">
                    <label className="block text-[#172554] font-semibold mb-1">
                      Certifications (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ISO 9001:2015, CE, BIS Certified, RoHS"
                      value={formData.certifications}
                      onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] focus:outline-hidden focus:border-[#1d4ed8]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Additional Information & Specs */}
              <div className="pt-2 border-t border-[#1e3a8a]/15">
                <h4 className="font-bold text-[#172554] text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1d4ed8]"></span>
                  5. Technical Specifications & Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Technical Specifications
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. 1080p@60fps, 90° FOV, USB 3.0 Type-C..."
                      value={formData.specifications}
                      onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] focus:outline-hidden focus:border-[#1d4ed8]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#172554] font-semibold mb-1">
                      Key Highlights & Features
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. AI Noise Suppression, Zero-Downtime Guarantee..."
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[#172554] focus:outline-hidden focus:border-[#1d4ed8]"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-[#1e3a8a]/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] font-semibold text-xs border border-[#1e3a8a]/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] font-semibold text-xs flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{editingId ? 'Update Product' : 'Publish Product to Catalogue'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-[#172554]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-2xl w-full max-w-md p-6 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-[#172554] mb-1">
              Delete Product from Catalogue?
            </h3>
            <p className="text-xs text-[#1e3a8a] mb-5">
              Are you sure you want to remove <span className="font-bold text-[#172554]">{deleteTarget.name}</span> (SKU: {deleteTarget.sku})? Your autonomous agent will no longer be able to offer or negotiate this product.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2 rounded-xl bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] font-semibold text-xs border border-[#1e3a8a]/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {deleteLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

