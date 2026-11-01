"use client";

import React, { useEffect, useState } from "react";
import Card from "../../components/shared/Card";
import Button from "../../components/shared/Button";
import Modal from "../../components/shared/Modal";
import { ProfitMarginMeter } from "../../components/shared/Charts";
import { productService } from "../../services/agentService";
import { negotiationService } from "../../services/negotiationService";
import { useUI } from "../../context/UIContext";
import { useBusiness } from "../../context/BusinessContext";
import { useAuth } from "../../context/AuthContext";
import { formatINR } from "../../utils/formatters";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Play, Eye, Building2 } from "lucide-react";


export default function MarketplacePage() {
  const router = useRouter();
  const { showToast } = useUI();
  const { profile } = useBusiness();
  const { isSeller, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isSeller) {
      router.replace("/seller/dashboard");
    }
  }, [isAuthenticated, isSeller, router]);

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Quick RFQ Launch Modal State
  const [selectedProductForRfq, setSelectedProductForRfq] = useState(null);
  const [targetQuantity, setTargetQuantity] = useState(12);
  const [targetBudget, setTargetBudget] = useState(50000);
  const [launchingRfq, setLaunchingRfq] = useState(false);

  // Inspect SKU Modal State
  const [inspectProduct, setInspectProduct] = useState(null);

  const CATEGORIES = [
    "ALL",
    "Electronics",
    "Warehouse",
    "Safety",
    "Office",
    "Retail-POS",
  ];

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
    const matchesCat =
      selectedCategory === "ALL" || p.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenRfq = (product) => {
    setSelectedProductForRfq(product);
    setTargetQuantity(12);
    const unitCost = Number(product.baseCostPrice || 2500);
    setTargetBudget(Math.round(unitCost * 12 * 1.1));
  };

  const handleExecuteRfq = async (e) => {
    e.preventDefault();
    if (!selectedProductForRfq) return;
    setLaunchingRfq(true);

    try {
      const res = await negotiationService.create({
        targetProductId: selectedProductForRfq.id,
        targetQuantity: Number(targetQuantity),
        maxBudget: Number(targetBudget),
        maxDeliveryHours: selectedProductForRfq.typicalLeadTimeHours || 48,
        targetResaleMargin: 25,
      });

      const newId = res?.data?.id;
      showToast(
        `Autonomous RFQ initiated for ${selectedProductForRfq.name}!`,
        "success",
      );
      setSelectedProductForRfq(null);
      if (newId) {
        router.push(`/negotiation?id=${newId}`);
      } else {
        router.push("/negotiation");
      }
    } catch {
      showToast("Initiated session.", "info");
      setSelectedProductForRfq(null);
      router.push("/negotiation");
    } finally {
      setLaunchingRfq(false);
    }
  };

  return (
    <div className="space-y-6 text-[#172554]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172554] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#1d4ed8] shrink-0" /> B2B
            Marketplace Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#1e3a8a] mt-1">
            40 wholesale enterprise SKUs ready for multi-agent procurement
            within the ₹50,000 budget cap.
          </p>
        </div>
        <div className="text-xs text-[#1e3a8a] font-mono bg-[#fffdf9] border border-[#1e3a8a]/20 px-3 py-1.5 rounded-xl font-bold">
          Showing{" "}
          <span className="text-[#1d4ed8]">{filteredProducts.length}</span> of
          40 SKUs
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#fffdf9] border border-[#1e3a8a]/20 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-[#1d4ed8] text-[#faf7ee] shadow-xs"
                  : "bg-[#f4efe3] text-[#1e3a8a] hover:bg-[#eadecc] hover:text-[#172554] border border-[#1e3a8a]/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#1e3a8a] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SKU or product title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-xl text-xs text-[#172554] placeholder-[#1e3a8a]/50 focus:outline-none focus:border-[#1d4ed8]"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#f4efe3] border border-[#1e3a8a]/20 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-[#1d4ed8]" />
          </div>
          <h3 className="text-lg font-bold text-[#172554] mb-1">
            {products.length === 0
              ? "No Products in Marketplace Yet"
              : "No Matching Products Found"}
          </h3>
          <p className="text-xs text-[#1e3a8a] max-w-md mx-auto">
            {products.length === 0
              ? "Participating suppliers have not published wholesale products yet. When suppliers add products to their catalogue, they will appear here dynamically for autonomous RFQs."
              : "Try adjusting your search criteria or category filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const margin =
              product.targetSellingPrice > 0
                ? (
                    ((product.targetSellingPrice - product.baseCostPrice) /
                      product.targetSellingPrice) *
                    100
                  ).toFixed(1)
                : "25.0";

            return (
              <Card
                key={product.id || product.sku}
                className="flex flex-col justify-between hover:border-[#1d4ed8] transition-all bg-[#fffdf9] border border-[#1e3a8a]/20 shadow-xs"
              >
                <div>
                  {/* SKU + Category */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#1d4ed8] px-2 py-0.5 rounded-lg bg-[#f4efe3] border border-[#1e3a8a]/20 font-bold">
                      {product.sku}
                    </span>
                    <span className="text-[11px] text-[#1e3a8a]">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#172554] line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#1e3a8a] mt-1 line-clamp-2 leading-relaxed">
                    {product.description ||
                      "Enterprise grade wholesale procurement item."}
                  </p>

                  {/* Price & Margin Matrix */}
                  <div className="mt-4 pt-3 border-t border-[#1e3a8a]/15 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#1e3a8a] block text-[10px]">
                        Wholesale Base
                      </span>
                      <span className="font-mono text-[#172554] font-bold">
                        {formatINR(product.baseCostPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#1e3a8a] block text-[10px]">
                        Target Selling
                      </span>
                      <span className="font-mono text-[#1d4ed8] font-bold">
                        {formatINR(product.targetSellingPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#1e3a8a] block text-[10px]">
                        In Stock
                      </span>
                      <span className="text-[#172554] font-mono font-bold">
                        {product.inventory?.stockQuantity !== undefined
                          ? product.inventory.stockQuantity
                          : product.stockQuantity || 0}{" "}
                        units
                      </span>
                    </div>
                    <div>
                      <span className="text-[#1e3a8a] block text-[10px]">
                        Projected Margin
                      </span>
                      <span className="text-[#1d4ed8] font-mono font-bold">
                        {margin}%
                      </span>
                    </div>
                  </div>
                </div>
                {/* Organization Name */}
<div className="flex items-center gap-1.5 mt-3 mb-2 text-xs">
  <Building2 className="w-3.5 h-3.5 text-[#1d4ed8] shrink-0" />
  <span className="text-[#1e3a8a]">Sold by</span>
  <span className="font-bold text-[#172554] truncate">
    {product.business?.name || "Organization unavailable"}
  </span>
</div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-[#1e3a8a]/15 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInspectProduct(product)}
                    className="shrink-0 gap-1 text-xs font-bold whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenRfq(product)}
                    className="flex-1 min-w-0 gap-1.5 text-xs font-bold whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5 shrink-0" />
                    Launch RFQ
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Inspect SKU Details Modal */}
      <Modal
        isOpen={Boolean(inspectProduct)}
        onClose={() => setInspectProduct(null)}
        title={inspectProduct?.name || "Product Specifications"}
        subtitle={`SKU: ${inspectProduct?.sku} | Category: ${inspectProduct?.category}`}
      >
        {inspectProduct && (
          <div className="space-y-4 text-xs text-[#172554]">
            <p className="leading-relaxed text-[#172554]">
              {inspectProduct.description}
            </p>

            <ProfitMarginMeter
              costPrice={inspectProduct.baseCostPrice}
              sellingPrice={inspectProduct.targetSellingPrice}
            />

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[11px] font-mono">
              <div>
                <span className="text-[#1e3a8a] block">
                  Quality Classification:
                </span>
                <span className="text-[#172554] font-bold">
                  {inspectProduct.qualityGrade || "Enterprise"}
                </span>
              </div>
              <div>
                <span className="text-[#1e3a8a] block">
                  Typical Dispatch Lead Time:
                </span>
                <span className="text-[#172554] font-bold">
                  {inspectProduct.typicalLeadTimeHours || 24} Hours
                </span>
              </div>
              <div>
                <span className="text-[#1e3a8a] block">
                  Warehouse Available Stock:
                </span>
                <span className="text-[#172554] font-bold">
                  {inspectProduct.stockQuantity || 100} units
                </span>
              </div>
              <div>
                <span className="text-[#1e3a8a] block">Warranty Period:</span>
                <span className="text-[#172554] font-bold">
                  {inspectProduct.warrantyMonths || 24} Months
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInspectProduct(null)}
              >
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
                className="gap-1.5 font-bold"
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
          <form
            onSubmit={handleExecuteRfq}
            className="space-y-4 text-xs text-[#172554]"
          >
            <div className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 flex justify-between items-center text-xs">
              <div>
                <span className="text-[#1e3a8a] block text-[11px]">
                  Selected SKU
                </span>
                <span className="font-mono font-bold text-[#1d4ed8]">
                  {selectedProductForRfq.sku}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#1e3a8a] block text-[11px]">
                  Wholesale Unit Cost
                </span>
                <span className="font-mono text-[#1d4ed8] font-bold">
                  {formatINR(selectedProductForRfq.baseCostPrice)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1">
                  Target Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={targetQuantity}
                  onChange={(e) => {
                    const newQty = e.target.value;
                    setTargetQuantity(newQty);
                    const unitCost = Number(
                      selectedProductForRfq?.baseCostPrice || 2500,
                    );
                    setTargetBudget(
                      Math.round(unitCost * Number(newQty || 0) * 1.1),
                    );
                  }}
                  className="w-full px-3 py-2 bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-lg text-[#172554] text-xs font-mono focus:outline-none focus:border-[#1d4ed8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1">
                  Budget Ceiling (INR)
                </label>
                <input
                  type="number"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-lg text-[#1d4ed8] text-xs font-mono font-bold focus:outline-none focus:border-[#1d4ed8]"
                />
                <span className="text-[10px] text-[#1e3a8a]">
                  {Number(targetBudget) > (profile?.budgetLimit || 50000) ? (
                    <span className="text-[#172554] font-bold">
                      Exceeds Enterprise Cap (
                      {formatINR(profile?.budgetLimit || 50000)})
                    </span>
                  ) : (
                    <span>+10% buffer included • Within Enterprise Cap</span>
                  )}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f4efe3] border border-[#1e3a8a]/20 text-[11px] text-[#172554] leading-relaxed">
              <strong>Autonomous Multi-Agent Handshake:</strong> Upon broadcast,
              Buyer Agent will solicit bids simultaneously from Seller A
              (Wholesale Price), Seller B (Express SLA), and scan Seller C
              through Zero-Trust filters.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedProductForRfq(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={launchingRfq}
                className="gap-1.5 font-bold"
              >
                <Play className="w-3.5 h-3.5" /> Initialize Negotiation Room
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
