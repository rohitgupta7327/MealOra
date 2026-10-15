import React, { useState, useMemo, useRef } from "react";
import {
  MenuSquare,
  Plus,
  X,
  Edit2,
  Search,
  Upload,
  Image as ImageIcon,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";

export default function AdminMenuView({
  menuItems = [],
  onToggleStock,
  onAddMenuItem,
  onEditMenuItem,
  onDeleteMenuItem,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // File upload state for Add Dish
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploadMode, setImageUploadMode] = useState("upload"); // 'upload' | 'url'
  const fileInputRef = useRef(null);

  // File upload state for Edit Dish
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editUploadMode, setEditUploadMode] = useState("upload");
  const editFileInputRef = useRef(null);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "Mains",
    price: "",
    description: "",
    prepTime: "12 min",
    image: "",
    inStock: true,
  });

  const categories = ["All", "Burgers", "Mains", "Sides", "Desserts", "Drinks"];

  // Search & category filter in Admin view
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Handle local image file selection for Add Dish
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Image size exceeds 5MB limit. Please choose a smaller image.");
        return;
      }
      setErrorMsg(null);
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle local image file selection for Edit Dish
  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Image size exceeds 5MB limit.");
        return;
      }
      setErrorMsg(null);
      setEditImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setEditImagePreview(previewUrl);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", newItem.name.trim());
      formData.append("category", newItem.category);
      formData.append("price", newItem.price);
      formData.append("description", newItem.description || "");
      formData.append("prepTime", newItem.prepTime || "12 min");
      formData.append("inStock", newItem.inStock);

      if (imageUploadMode === "upload" && imageFile) {
        formData.append("image", imageFile);
      } else if (newItem.image) {
        formData.append("image", newItem.image.trim());
      }

      await onAddMenuItem(formData);

      // Reset form
      setNewItem({
        name: "",
        category: "Mains",
        price: "",
        description: "",
        prepTime: "12 min",
        image: "",
        inStock: true,
      });
      setImageFile(null);
      setImagePreview(null);
      setShowAddModal(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to create dish.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name || !editingItem.price) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", editingItem.name.trim());
      formData.append("category", editingItem.category);
      formData.append("price", editingItem.price);
      formData.append("description", editingItem.description || "");
      formData.append("prepTime", editingItem.prepTime || "12 min");
      formData.append("inStock", editingItem.inStock);

      if (editUploadMode === "upload" && editImageFile) {
        formData.append("image", editImageFile);
      } else if (editingItem.image) {
        formData.append("image", editingItem.image.trim());
      }

      if (onEditMenuItem) {
        await onEditMenuItem(editingItem.id, formData);
      }

      setEditingItem(null);
      setEditImageFile(null);
      setEditImagePreview(null);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update dish.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-[#191513] border border-[#e6ddd3] dark:border-[#2e2723] shadow-sm dark:shadow-none transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <MenuSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1c1613] dark:text-[#f5f2eb]">
              Menu & Inventory Management
            </h2>
            <p className="text-xs text-[#736357] dark:text-[#9c8e84]">
              Add dishes with image uploads to backend • Real-time MongoDB Atlas inventory sync
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#ea580c] to-[#f59e0b] text-white hover:brightness-110 transition-colors shadow-md shadow-[#ea580c]/25 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#181412] border border-[#e6ddd3] dark:border-[#2e2723]">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c786c] dark:text-[#7d6f65]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish or ingredients..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2b241f] text-xs text-[#1c1613] dark:text-[#f5f2eb] placeholder-[#8c786c] dark:placeholder-[#6b5f56] focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === cat
                ? "bg-amber-500 text-black font-bold shadow-sm"
                : "bg-[#faf7f2] dark:bg-[#201a17] text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] border border-[#ded5ca] dark:border-[#2e2723]"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Table */}
      <div className="rounded-2xl bg-white dark:bg-[#181412] border border-[#e6ddd3] dark:border-[#2e2723] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e6ddd3] dark:border-[#2e2723] bg-[#faf7f2] dark:bg-[#1e1916] text-[#736357] dark:text-[#8a7c72] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Prep Time</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6ddd3] dark:divide-[#2e2723]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#736357] dark:text-[#9c8e84]">
                    No dishes found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-amber-500/5 dark:hover:bg-amber-500/[0.02] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#e6ddd3] dark:border-[#2e2723] bg-[#faf7f2] dark:bg-[#1f1a16]"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div>
                          <div className="font-bold text-sm text-[#1c1613] dark:text-[#f5f2eb]">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-[#736357] dark:text-[#8a7c72] truncate max-w-xs">
                            {item.description || "Fresh chef creation"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f4efe8] dark:bg-[#26201b] border border-[#ded5ca] dark:border-[#382f28] text-amber-700 dark:text-amber-300">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                      ${Number(item.price).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-[#736357] dark:text-[#9c8e84]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        {item.prepTime || "12 min"}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {item.inStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          86'd / Sold Out
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Dish Button */}
                        <button
                          onClick={() => {
                            setErrorMsg(null);
                            setEditingItem({ ...item });
                            setEditImageFile(null);
                            setEditImagePreview(item.image);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#221c18] hover:border-amber-500 text-[#1c1613] dark:text-[#f5f2eb] border border-[#ded5ca] dark:border-[#332a24] transition-all cursor-pointer"
                          title="Edit Dish Details"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Edit</span>
                        </button>

                        {/* Quick Stock Toggle Button */}
                        <button
                          onClick={() => onToggleStock(item.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${item.inStock
                            ? "bg-red-500/15 hover:bg-red-500/25 text-red-700 dark:text-red-400 border border-red-500/30"
                            : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                            }`}
                        >
                          {item.inStock ? "86 Dish" : "Restock"}
                        </button>

                        {/* Delete Dish Button */}
                        {onDeleteMenuItem && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${item.name}" from the database?`)) {
                                onDeleteMenuItem(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-[#736357] dark:text-[#8a7c72] hover:text-red-600 hover:bg-red-500/10 border border-[#ded5ca] dark:border-[#332a24] transition-all cursor-pointer"
                            title="Delete Dish from Database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Dish Modal with Image Upload */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#181412] border border-[#e6ddd3] dark:border-[#382f28] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ddd3] dark:border-[#2e2723]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1c1613] dark:text-[#f5f2eb]">
                    Add New Culinary Dish
                  </h3>
                  <p className="text-[11px] text-[#736357] dark:text-[#9c8e84]">
                    Upload photo to backend & save dish to MongoDB Atlas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              {/* Dish Name */}
              <div>
                <label className="block text-[#736357] dark:text-[#a89b91] mb-1 font-semibold">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pan-Seared Chilean Sea Bass"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723] text-[#1c1613] dark:text-[#f5f2eb] focus:border-amber-500 focus:outline-none font-medium text-xs"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#736357] dark:text-[#a89b91] mb-1 font-semibold">
                    Category
                  </label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723] text-[#1c1613] dark:text-[#f5f2eb] focus:border-amber-500 focus:outline-none font-medium text-xs"
                  >
                    {["Burgers", "Mains", "Sides", "Desserts", "Drinks"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#736357] dark:text-[#a89b91] mb-1 font-semibold">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="24.50"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723] text-[#1c1613] dark:text-[#f5f2eb] focus:border-amber-500 focus:outline-none font-mono font-medium text-xs"
                  />
                </div>
              </div>

              {/* Preparation Time & Description */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[#736357] dark:text-[#a89b91] mb-1 font-semibold">
                    Prep Time
                  </label>
                  <input
                    type="text"
                    placeholder="12 min"
                    value={newItem.prepTime}
                    onChange={(e) => setNewItem({ ...newItem, prepTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723] text-[#1c1613] dark:text-[#f5f2eb] focus:border-amber-500 focus:outline-none font-medium text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[#736357] dark:text-[#a89b91] mb-1 font-semibold">
                    Culinary Description
                  </label>
                  <input
                    type="text"
                    placeholder="Ingredients, seasonings, sides..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723] text-[#1c1613] dark:text-[#f5f2eb] focus:border-amber-500 focus:outline-none font-medium text-xs"
                  />
                </div>
              </div>

              {/* Dish Image Upload Section */}
              <div className="p-3.5 rounded-2xl bg-[#faf7f2] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723]">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-[#1c1613] dark:text-[#f5f2eb] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    Dish Image
                  </span>
                  <div className="flex items-center gap-1 bg-[#ede4d8] dark:bg-[#201a16] p-0.5 rounded-lg border border-[#ded5ca] dark:border-[#2e2723]">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode("upload")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${imageUploadMode === "upload"
                        ? "bg-amber-500 text-black shadow-sm"
                        : "text-[#736357] dark:text-[#9c8e84]"
                        }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode("url")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${imageUploadMode === "url"
                        ? "bg-amber-500 text-black shadow-sm"
                        : "text-[#736357] dark:text-[#9c8e84]"
                        }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageUploadMode === "upload" ? (
                  <div>
                    {imagePreview ? (
                      <div className="relative group rounded-xl overflow-hidden border border-[#ded5ca] dark:border-[#382f28]">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-36 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 cursor-pointer shadow-md"
                          >
                            Change Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-500 cursor-pointer shadow-md"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="p-2 bg-[#faf7f2] dark:bg-[#1d1815] text-[11px] text-[#736357] dark:text-[#9c8e84] truncate">
                          File: <strong>{imageFile?.name}</strong> ({(imageFile?.size / 1024).toFixed(1)} KB)
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#ded5ca] dark:border-[#382f28] hover:border-amber-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-white/50 dark:bg-[#1a1613]/50"
                      >
                        <Upload className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-[#1c1613] dark:text-[#f5f2eb]">
                          Click to upload dish photo
                        </p>
                        <p className="text-[10px] text-[#736357] dark:text-[#8a7c72] mt-0.5">
                          PNG, JPG, WEBP up to 5MB • Saves directly to Backend/uploads
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newItem.image}
                      onChange={(e) => {
                        setNewItem({ ...newItem, image: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1d1815] border border-[#ded5ca] dark:border-[#2e2723] text-[#1c1613] dark:text-[#f5f2eb] focus:border-amber-500 focus:outline-none text-xs"
                    />
                    {newItem.image && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-[#ded5ca] dark:border-[#382f28] h-28">
                        <img
                          src={newItem.image}
                          alt="URL Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="addInStock"
                  checked={newItem.inStock}
                  onChange={(e) => setNewItem({ ...newItem, inStock: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
                <label
                  htmlFor="addInStock"
                  className="text-xs font-semibold text-[#1c1613] dark:text-[#f5f2eb] cursor-pointer"
                >
                  Dish is immediately available in active POS stock
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#e6ddd3] dark:border-[#2e2723] flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black cursor-pointer shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving & Uploading...</span>
                    </>
                  ) : (
                    <span>Save Dish to Database</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dish Modal with Image Upload */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#181412] border border-[#e6ddd3] dark:border-[#382f28] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6ddd3] dark:border-[#2e2723]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Edit2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1c1613] dark:text-[#f5f2eb]">
                    Edit Menu Dish #{editingItem.id}
                  </h3>
                  <p className="text-[11px] text-[#736357] dark:text-[#9c8e84]">
                    Update dish details and image in MongoDB Atlas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-[#736357] dark:text-[#a89b91] mb-1 font-semibold">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723] text-[#1c1613] dark:text-[#f5f2eb] focus:border-amber-500 focus:outline-none font-medium text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#736357] dark:text-[#a89b91] mb-1 font-semibold">
                    Category
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723] text-[#1c1613] dark:text-[#f5f2eb] focus:border-amber-500 focus:outline-none font-medium text-xs"
                  >
                    {["Burgers", "Mains", "Sides", "Desserts", "Drinks"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#736357] dark:text-[#a89b91] mb-1 font-semibold">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723] text-[#1c1613] dark:text-[#f5f2eb] focus:border-amber-500 focus:outline-none font-mono font-medium text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#736357] dark:text-[#a89b91] mb-1 font-semibold">
                  Culinary Description
                </label>
                <textarea
                  rows="2"
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723] text-[#1c1613] dark:text-[#f5f2eb] focus:border-amber-500 focus:outline-none font-medium text-xs"
                />
              </div>

              {/* Edit Image Upload */}
              <div className="p-3.5 rounded-2xl bg-[#faf7f2] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1c1613] dark:text-[#f5f2eb] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    Dish Image
                  </span>
                  <div className="flex items-center gap-1 bg-[#ede4d8] dark:bg-[#201a16] p-0.5 rounded-lg border border-[#ded5ca] dark:border-[#2e2723]">
                    <button
                      type="button"
                      onClick={() => setEditUploadMode("upload")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${editUploadMode === "upload"
                        ? "bg-amber-500 text-black shadow-sm"
                        : "text-[#736357] dark:text-[#9c8e84]"
                        }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditUploadMode("url")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${editUploadMode === "url"
                        ? "bg-amber-500 text-black shadow-sm"
                        : "text-[#736357] dark:text-[#9c8e84]"
                        }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {editUploadMode === "upload" ? (
                  <div>
                    <div className="relative group rounded-xl overflow-hidden border border-[#ded5ca] dark:border-[#382f28]">
                      <img
                        src={editImagePreview || editingItem.image}
                        alt="Dish Preview"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 cursor-pointer shadow-md"
                        >
                          Upload New Photo
                        </button>
                      </div>
                    </div>
                    {editImageFile && (
                      <p className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ Selected: {editImageFile.name} ({(editImageFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleEditFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={editingItem.image || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1d1815] border border-[#ded5ca] dark:border-[#2e2723] text-[#1c1613] dark:text-[#f5f2eb] focus:border-amber-500 focus:outline-none text-xs"
                    />
                  </div>
                )}
              </div>

              {/* In Stock Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editInStock"
                  checked={editingItem.inStock}
                  onChange={(e) => setEditingItem({ ...editingItem, inStock: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
                <label
                  htmlFor="editInStock"
                  className="text-xs font-semibold text-[#1c1613] dark:text-[#f5f2eb] cursor-pointer"
                >
                  Dish is in stock
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#e6ddd3] dark:border-[#2e2723] flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
