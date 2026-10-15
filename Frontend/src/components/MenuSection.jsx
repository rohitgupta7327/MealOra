import React, { useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Check,
  X,
  AlertCircle,
  Clock,
  Star,
} from "lucide-react";

/**
 * High-Performance Memoized Menu Item Card
 * Prevents full grid re-rendering when cart quantity or active category changes
 */
const MenuItemCard = React.memo(function MenuItemCard({
  item,
  inCartQty,
  onAddToCart,
}) {
  const isOutOfStock = !item.inStock;

  const handleAdd = useCallback(() => {
    if (!isOutOfStock) {
      onAddToCart(item);
    }
  }, [isOutOfStock, onAddToCart, item]);

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#1b1715] to-[#161311] border transition-all duration-200 overflow-hidden ${isOutOfStock
        ? "opacity-60 border-[#2a2420] bg-[#151211] cursor-not-allowed"
        : "border-[#2e2723] hover:border-amber-500/40 hover:shadow-xl hover:shadow-black/60 hover:-translate-y-1"
        }`}
    >
      {/* Image Section */}
      <div className="relative w-full h-40 bg-[#251f1a] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-300 ${isOutOfStock
            ? "grayscale filter contrast-75"
            : "group-hover:scale-105"
            }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161311] via-transparent to-black/30 pointer-events-none" />

        {/* Category Pill Tag */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#141110]/85 backdrop-blur-md text-[#c5b8ad] border border-white/10 shadow-sm">
            {item.category}
          </span>
        </div>

        {/* Availability Badge */}
        <div className="absolute top-2.5 right-2.5">
          {item.inStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-500/20 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              In Stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-red-500/20 backdrop-blur-md text-red-400 border border-red-500/30 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Out of Stock
            </span>
          )}
        </div>

        {/* In-Cart Quantity Indicator Badge */}
        {inCartQty > 0 && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#f59e0b] text-black shadow-md flex items-center gap-1">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>{inCartQty} in cart</span>
          </div>
        )}

        {/* Rating / Prep time */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 text-[10px] text-[#e0d6cd] font-medium drop-shadow-sm">
          {item.rating && (
            <span className="flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              {item.rating}
            </span>
          )}
          {item.prepTime && (
            <span className="flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
              <Clock className="w-2.5 h-2.5 text-[#a89b91]" />
              {item.prepTime}
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h4 className="font-bold text-sm text-[#f5f2eb] group-hover:text-amber-400 transition-colors line-clamp-1">
            {item.name}
          </h4>
          <p className="text-xs text-[#9c8e84] mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Bottom Row: Price + Add Button */}
        <div className="mt-4 pt-3 border-t border-[#2a231f] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#8a7c72] block">
              Price
            </span>
            <span className="font-mono text-base font-extrabold text-[#f59e0b]">
              ₹{item.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`relative flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${isOutOfStock
              ? "bg-[#251f1a] text-[#6b5f56] border border-[#332a24] cursor-not-allowed opacity-60"
              : inCartQty > 0
                ? "bg-gradient-to-r from-[#ea580c] to-[#f59e0b] text-white shadow-md shadow-[#ea580c]/30 hover:brightness-110 active:scale-95"
                : "bg-[#26201b] hover:bg-gradient-to-r hover:from-[#ea580c] hover:to-[#f59e0b] text-amber-400 hover:text-white border border-[#3a3029] hover:border-transparent active:scale-95 shadow-sm"
              }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>
              {isOutOfStock
                ? "Unavailable"
                : inCartQty > 0
                  ? "Add More"
                  : "+ Add to Cart"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default function MenuSection({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  menuItems,
  onAddToCart,
  cartItems = [],
}) {
  /**
   * OPTIMIZATION 1: O(C) Hash Map for O(1) Cart Quantity Lookups
   * Eliminates nested O(M x C) array.find scans across all menu cards.
   */
  const cartQtyMap = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < cartItems.length; i++) {
      map.set(cartItems[i].id, cartItems[i].quantity);
    }
    return map;
  }, [cartItems]);

  /**
   * OPTIMIZATION 2: O(N) Single-Pass Hash Map for Category Item Counts
   * Replaces K separate array filter operations (O(K x N)) with a single pass O(N).
   */
  const categoryCounts = useMemo(() => {
    const counts = { All: menuItems.length };
    for (let i = 0; i < menuItems.length; i++) {
      const cat = menuItems[i].category;
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [menuItems]);

  /**
   * OPTIMIZATION 3: Memoized Search & Filter with Fast Short-Circuiting
   * Prevents re-computing strings on unrelated re-renders; skips string conversions
   * if the category check fails first.
   */
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Fast-path: return all items directly without filtering overhead
    if (!query && selectedCategory === "All") {
      return menuItems;
    }

    return menuItems.filter((item) => {
      // 1. Fast category check (O(1) scalar comparison)
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      if (!query) return true;

      // 2. Short-circuited string searches
      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      {/* Top Controls: Search Bar & Filter Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9c8e84]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artisan dishes, ingredients, drinks..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#1a1613] border border-[#2e2723] text-sm text-[#f5f2eb] placeholder-[#7d6f65] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all duration-150"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9c8e84] hover:text-[#f5f2eb]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-[#9c8e84] px-1 font-medium">
          <span>
            Showing <strong className="text-amber-400 font-mono">{filteredItems.length}</strong> items
          </span>
          {selectedCategory !== "All" && (
            <span className="hidden md:inline-block px-2 py-0.5 rounded bg-[#26201b] border border-[#382f28] text-amber-300">
              {selectedCategory}
            </span>
          )}
        </div>
      </div>

      {/* Category Pills (Horizontal Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-4 scrollbar-none no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${isActive
                ? "bg-gradient-to-r from-[#ea580c] to-[#f59e0b] text-white shadow-lg shadow-[#ea580c]/25 border border-amber-400/30 scale-102"
                : "bg-[#1c1815] text-[#a89b91] hover:text-[#f5f2eb] hover:bg-[#251f1a] border border-[#2e2723]"
                }`}
            >
              <span>{cat}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${isActive
                  ? "bg-black/35 text-white"
                  : "bg-[#28221d] text-[#8a7c72]"
                  }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Menu Item Cards Grid (3 Columns) */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-[#181513] border border-[#2e2723] text-center my-auto">
          <div className="w-12 h-12 rounded-full bg-[#26201b] flex items-center justify-center text-amber-400 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#f5f2eb]">No menu items found</h3>
          <p className="text-xs text-[#9c8e84] mt-1 max-w-sm">
            No dishes match "{searchQuery}" in category "{selectedCategory}". Try
            clearing your search or choosing another category.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-[#251f1a] hover:bg-[#2e2621] text-xs font-semibold text-amber-400 border border-[#3a3029] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4 overflow-y-auto pr-1">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              inCartQty={cartQtyMap.get(item.id) || 0}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
