'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { sellerService } from '../../../services/sellerService';
import {
  Store,
  Bot,
  Package,
  Plus,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
  RefreshCw,
  Edit3,
  Save,
  X,
  AlertTriangle,
  ArrowRight,
  Boxes,
  Truck,
  Sparkles,
  BarChart3,
  MessageSquareCode,
  Sliders,
} from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isSeller, isLoading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Stock edit state
  const [editingProduct, setEditingProduct] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [newMinThreshold, setNewMinThreshold] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState('');

  const fetchDashboard = async () => {
    try {
      setError(null);
      const res = await sellerService.getDashboard();
      if (res?.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load seller telemetry:', err);
      setError(err?.message || 'Could not load seller telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && isSeller) {
        fetchDashboard();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, isSeller]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleEditStock = (prod) => {
    setEditingProduct(prod);
    setNewStock(prod.inventory?.stockQuantity ?? 100);
    setNewMinThreshold(prod.inventory?.minThreshold ?? 15);
    setUpdateFeedback('');
  };

  const handleSaveStock = async () => {
    if (!editingProduct) return;
    setUpdateLoading(true);
    setUpdateFeedback('');
    try {
      await sellerService.updateStock(editingProduct.id, {
        stockQuantity: Number(newStock),
        minThreshold: Number(newMinThreshold),
      });
      setUpdateFeedback('Inventory stock updated successfully');
      setEditingProduct(null);
      fetchDashboard();
    } catch (err) {
      setUpdateFeedback(err?.message || 'Failed to update inventory');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Auth Guard: Unauthenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-[#fffdf9] rounded-2xl border border-[#1e3a8a]/20">
        <div className="w-16 h-16 rounded-2xl bg-[#f4efe3] border border-[#1e3a8a]/20 flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-[#1d4ed8]" />
        </div>
        <h2 className="text-xl font-bold text-[#172554] mb-2">Seller Authentication Required</h2>
        <p className="text-sm text-[#1e3a8a] max-w-md mb-6">
          You must be logged into an authorized Supplier account to access the seller telemetry dashboard, inventory controls, and autonomous agent bidding history.
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
          <ShieldAlert className="w-8 h-8 text-[#1d4ed8]" />
        </div>
        <h2 className="text-xl font-bold text-[#172554] mb-2">Portal Access Restriction</h2>
        <p className="text-sm text-[#1e3a8a] max-w-md mb-4">
          Your current session is authenticated as an <span className="font-semibold text-[#172554]">Enterprise Buyer</span> ({user?.name} - {user?.business?.name || 'Apex Retail'}).
        </p>
        <p className="text-xs text-[#1e3a8a] max-w-md mb-6">
          Backend role-based security prohibits buyers from accessing supplier private inventory and quotation endpoints. Please switch to a Seller account or return to the Buyer Command Center.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] font-semibold text-sm transition-all"
          >
            Buyer Command Center
          </button>
          <button
            onClick={() => router.push('/login?portal=SELLER')}
            className="px-5 py-2.5 rounded-xl bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] font-semibold text-sm border border-[#1e3a8a]/20 transition-all"
          >
            Switch to Seller Account
          </button>
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1d4ed8] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-[#1e3a8a]">Loading supplier telemetry & autonomous agent metrics...</p>
      </div>
    );
  }

  const { business, agent, metrics, recentOffers = [], transactions = [], products = [] } = dashboardData || {};

  return (
    <div className="space-y-6 text-[#172554]">
      {/* Top Header & Identity Card */}
      <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1">
                <Store className="w-3 h-3" />
                Verified Supplier Portal
              </span>
              <span className="text-xs text-[#1e3a8a] font-mono">
                {business?.registrationNumber || 'IN-SUP-VERIFIED'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172554]">
              {business?.name || 'Autonomous Supplier Organization'}
            </h1>
            <p className="text-xs sm:text-sm text-[#1e3a8a] mt-1">
              Representative: <span className="text-[#172554] font-medium">{user?.name}</span> ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/seller/settings"
              className="p-2.5 rounded-xl bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] border border-[#1e3a8a]/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sliders className="w-4 h-4 text-[#1d4ed8]" />
              <span>Settings</span>
            </Link>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] border border-[#1e3a8a]/20 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 text-[#1d4ed8] ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Autonomous Agent Identity & Strategy Card */}
        {agent && (
          <div className="mt-6 pt-5 border-t border-[#1e3a8a]/15 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20">
              <div className="flex items-center gap-2 text-xs text-[#1e3a8a] mb-1">
                <Bot className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span>Autonomous Agent</span>
              </div>
              <div className="text-sm font-bold text-[#172554]">{agent.name}</div>
              <div className="text-[11px] font-mono text-[#1d4ed8] mt-0.5">{agent.agentType}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20">
              <div className="flex items-center gap-2 text-xs text-[#1e3a8a] mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span>Zero-Trust Reliability Rating</span>
              </div>
              <div className="text-sm font-bold text-[#172554]">
                {metrics?.trustScore ? `${metrics.trustScore}% Trust Score` : '95.0% Trust Score'}
              </div>
              <div className="text-[11px] text-[#1e3a8a] mt-0.5">Continuous deterministic filter pass rate</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20">
              <div className="flex items-center gap-2 text-xs text-[#1e3a8a] mb-1">
                <Truck className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span>SLA Dispatch Speed</span>
              </div>
              <div className="text-sm font-bold text-[#172554]">{metrics?.leadTimeHours || 24}h Guaranteed Dispatch</div>
              <div className="text-[11px] text-[#1e3a8a] mt-0.5">Automated warehouse SLA commitment</div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1e3a8a]">Total Settled Revenue</span>
            <div className="p-2 rounded-xl bg-[#f4efe3] text-[#1d4ed8]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#172554]">
            ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#1d4ed8] mt-1 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{metrics?.settledDealsCount || 0} Deals Won & Settled</span>
          </div>
        </div>

        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1e3a8a]">Active Quotations</span>
            <div className="p-2 rounded-xl bg-[#f4efe3] text-[#1d4ed8]">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#172554]">{metrics?.totalOffersCount || 0}</div>
          <div className="text-[11px] text-[#1e3a8a] mt-1">Autonomous RFQ submissions</div>
        </div>

        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1e3a8a]">Catalog SKUs</span>
            <div className="p-2 rounded-xl bg-[#f4efe3] text-[#1d4ed8]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#172554]">{metrics?.activeSkusCount || 0}</div>
          <div className="text-[11px] text-[#1e3a8a] mt-1">Products actively marketed</div>
        </div>

        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1e3a8a]">Inventory on Hand</span>
            <div className="p-2 rounded-xl bg-[#f4efe3] text-[#1d4ed8]">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#172554]">
            {(metrics?.totalInventoryUnits || 0).toLocaleString()} <span className="text-sm font-normal text-[#1e3a8a]">units</span>
          </div>
          <div className="text-[11px] text-[#1d4ed8] mt-1 font-semibold">
            ₹{(metrics?.totalInventoryValue || 0).toLocaleString('en-IN')} inventory value
          </div>
        </div>
      </div>

      {/* Main Grid: Inventory Management & Autonomous Quotes History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inventory & Stock Controls */}
        <div className="lg:col-span-7 bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#172554] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#1d4ed8]" />
                <span>Supplier Inventory & Stock Levels</span>
              </h2>
              <p className="text-xs text-[#1e3a8a] mt-0.5">
                Manage stock allocations and reorder thresholds across your product lines.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/seller/products"
                className="px-3 py-1.5 rounded-lg bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Manage Catalogue</span>
              </Link>
              <span className="text-xs font-mono text-[#172554] px-2.5 py-1 bg-[#f4efe3] rounded-lg border border-[#1e3a8a]/20 font-bold">
                {products.length} Products
              </span>
            </div>
          </div>

          {updateFeedback && (
            <div className="mb-4 p-3 rounded-lg bg-[#f4efe3] border border-[#1d4ed8]/30 text-[#172554] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1d4ed8] shrink-0" />
              <span>{updateFeedback}</span>
            </div>
          )}

          {products.length === 0 ? (
            <div className="py-10 text-center bg-[#faf7ee] rounded-xl border border-dashed border-[#1e3a8a]/20">
              <Package className="w-8 h-8 text-[#1d4ed8] mx-auto mb-2 opacity-80" />
              <h3 className="font-bold text-sm text-[#172554]">Your Product Catalogue is Empty</h3>
              <p className="text-xs text-[#1e3a8a] mt-1 max-w-sm mx-auto mb-4">
                Add wholesale products to your catalogue so autonomous buyer agents can negotiate deals with your AI agent.
              </p>
              <Link
                href="/seller/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] text-xs font-semibold shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Product</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e3a8a]/20 bg-[#f4efe3] text-[#172554] font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Product / SKU</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Base Cost / Wholesale</th>
                  <th className="py-2.5 px-3">Stock Units</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3a8a]/15">
                {products.map((prod) => {
                  const stock = prod.inventory?.stockQuantity ?? 0;
                  const minThresh = prod.inventory?.minThreshold ?? 15;
                  const isLow = stock <= minThresh;

                  return (
                    <tr key={prod.id} className="hover:bg-[#faf7ee] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#172554]">{prod.name || prod.title}</div>
                        <div className="font-mono text-[11px] text-[#1e3a8a]">{prod.sku}</div>
                      </td>
                      <td className="py-3 px-3 text-[#1e3a8a]">{prod.category}</td>
                      <td className="py-3 px-3">
                        <div className="text-[#172554] font-medium">₹{Number(prod.baseCostPrice).toLocaleString()}</div>
                        <div className="text-[10px] text-[#1e3a8a]">Wholesale Quote: ₹{Number(prod.targetSellingPrice || prod.retailPrice || 0).toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${isLow ? 'text-[#1d4ed8]' : 'text-[#172554]'}`}>
                            {stock}
                          </span>
                          {isLow && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 font-bold">
                              LOW
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#1e3a8a]">Min: {minThresh}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleEditStock(prod)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] border border-[#1e3a8a]/20 text-[11px] font-medium inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Edit3 className="w-3 h-3 text-[#1d4ed8]" />
                          <span>Update</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Right Column: Recent Quotations & Settled Transactions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Autonomous Agent Bids */}
          <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-[#172554] flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#1d4ed8]" />
                <span>Autonomous Quotes Log</span>
              </h2>
              <Link
                href="/seller/negotiation"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 text-[11px] font-semibold hover:bg-[#eadecc] transition-colors"
              >
                <MessageSquareCode className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span>Live RFQ Stream</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-[#1e3a8a] mb-4">
              Live quotes placed by your selling agent during buyer RFQs.
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {recentOffers.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#1e3a8a]">
                  No quotes logged yet. Launch an RFQ from the Buyer portal to trigger competitive bidding.
                </div>
              ) : (
                recentOffers.map((off) => (
                  <div
                    key={off.id}
                    className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 hover:border-[#1d4ed8] transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#172554]">
                        {off.product?.title || off.negotiation?.targetProduct?.title || 'B2B Catalog Item'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20">
                        {off.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#1e3a8a] mt-2">
                      <div>
                        Quoted: <span className="font-bold text-[#172554]">₹{Number(off.unitPrice).toLocaleString()}</span>/unit
                      </div>
                      <div>
                        Delivery: <span className="font-semibold text-[#172554]">{off.deliveryDays ? `${off.deliveryDays * 24}h` : '24h'}</span>
                      </div>
                      <div>
                        Round: <span className="font-mono text-[#172554]">R{off.roundNumber || 1}</span>
                      </div>
                      <div>
                        Buyer: <span className="text-[#172554]">{off.negotiation?.buyerBusiness?.name || 'Apex Retail'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Settled Transactions */}
          <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-[#172554] flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#1d4ed8]" />
              <span>Settlement Records</span>
            </h2>
            <p className="text-xs text-[#1e3a8a] mb-4">
              Transactions approved by buyers and settled via mock UPI.
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#1e3a8a]">
                  No completed transactions yet for this seller business.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 hover:border-[#1d4ed8] transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#1d4ed8]">
                        ₹{Number(tx.settlementAmount).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#f4efe3] text-[#172554] border border-[#1e3a8a]/20 font-bold">
                        {tx.settlementStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#172554] font-medium">
                      {tx.offer?.product?.title || 'Contract Order'}
                    </div>
                    <div className="text-[10px] text-[#1e3a8a] mt-1 flex items-center justify-between">
                      <span>Buyer: {tx.buyerBusiness?.name}</span>
                      <span className="font-mono">{tx.mockUpiReference || 'UPI-SETTLED'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172554]/40 backdrop-blur-xs">
          <div className="bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-[#172554]">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-[#1e3a8a] hover:text-[#172554]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Boxes className="w-5 h-5 text-[#1d4ed8]" />
              <h3 className="text-base font-bold text-[#172554]">Update Stock Allocation</h3>
            </div>
            <p className="text-xs text-[#1e3a8a] mb-4">
              Adjust available inventory units and safety reorder thresholds for{' '}
              <span className="text-[#172554] font-semibold">{editingProduct.title}</span>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172554] mb-1">
                  Available Warehouse Stock (Units)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-lg px-3 py-2 text-sm text-[#172554] focus:outline-none focus:border-[#1d4ed8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172554] mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={newMinThreshold}
                  onChange={(e) => setNewMinThreshold(e.target.value)}
                  className="w-full bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-lg px-3 py-2 text-sm text-[#172554] focus:outline-none focus:border-[#1d4ed8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] text-xs font-semibold border border-[#1e3a8a]/20"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStock}
                  disabled={updateLoading}
                  className="px-4 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {updateLoading ? (
                    <div className="w-4 h-4 border-2 border-[#faf7ee]/30 border-t-[#faf7ee] rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

