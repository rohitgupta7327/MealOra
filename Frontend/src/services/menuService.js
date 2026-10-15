import authService from "./authService";

const API_BASE = "/api/menu";

export const menuService = {
  /**
   * Fetch all menu items from MongoDB Atlas
   */
  async getMenuItems() {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) return null;
      const data = await res.json();
      return data.items || [];
    } catch (err) {
      console.warn("Could not fetch remote menu items:", err.message);
      return null;
    }
  },

  /**
   * Add a new dish with image file upload to backend & save details to MongoDB Atlas
   * (Admin Only)
   */
  async createMenuItem(formData) {
    const token = authService.getToken();
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // Multipart FormData automatically sets correct boundary
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to add new dish.");
    }

    return data.item;
  },

  /**
   * Update dish details and optionally upload replacement image
   * (Admin Only)
   */
  async updateMenuItem(id, formData) {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to update dish.");
    }

    return data.item;
  },

  /**
   * Toggle inStock availability in MongoDB Atlas
   * (Admin Only)
   */
  async toggleStock(id) {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}/stock`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to update stock status.");
    }

    return data.item;
  },

  /**
   * Delete dish from MongoDB Atlas
   * (Admin Only)
   */
  async deleteMenuItem(id) {
    const token = authService.getToken();
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to delete dish.");
    }

    return true;
  },
};

export default menuService;
