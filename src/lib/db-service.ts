import { supabase } from "./supabase";
import { products as mockProducts, suppliers as mockSuppliers, type Product, type Supplier, type Availability } from "./data";

const inMemoryOrders: any[] = [];

export const dbService = {
  // 1. PRODUCTS
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((p) => this.mapProduct(p));
      }
    } catch (err) {
      console.warn("Supabase fetch products failed, falling back to mock data:", err);
    }
    return mockProducts;
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return this.mapProduct(data);
      }
    } catch (err) {
      console.warn(`Supabase fetch product ${id} failed, falling back to mock data:`, err);
    }
    return mockProducts.find((p) => p.id === id) || null;
  },

  async createProduct(productData: Omit<Product, "rating" | "reviews">): Promise<Product> {
    const newProduct = {
      id: productData.id,
      name: productData.name,
      subtitle: productData.subtitle,
      material: productData.material,
      composition: productData.composition,
      image_url: productData.image,
      gallery_urls: productData.gallery,
      price_per_metre: productData.pricePerMetre,
      currency: productData.currency,
      moq: productData.moq,
      gsm: productData.gsm,
      width_cm: productData.widthCm,
      colors: productData.colors,
      supplier_id: productData.supplierId,
      rating: 5.0,
      reviews_count: 0,
      lead_time_days: productData.leadTimeDays,
      availability: productData.availability,
      certifications: productData.certifications,
      sustainable: productData.sustainable,
      tags: productData.tags,
      description: productData.description,
      stock_metres: productData.stockMetres,
    };

    const { data, error } = await supabase
      .from("products")
      .insert(newProduct)
      .select()
      .single();

    if (error) throw error;
    
    // Index product embedding in background
    import("./ai-service").then(({ aiService }) => {
      aiService.indexProduct(data.id);
    }).catch((err) => console.error("AI product indexing trigger failed:", err));

    return this.mapProduct(data);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
    if (updates.material !== undefined) dbUpdates.material = updates.material;
    if (updates.composition !== undefined) dbUpdates.composition = updates.composition;
    if (updates.image !== undefined) dbUpdates.image_url = updates.image;
    if (updates.gallery !== undefined) dbUpdates.gallery_urls = updates.gallery;
    if (updates.pricePerMetre !== undefined) dbUpdates.price_per_metre = updates.pricePerMetre;
    if (updates.moq !== undefined) dbUpdates.moq = updates.moq;
    if (updates.gsm !== undefined) dbUpdates.gsm = updates.gsm;
    if (updates.widthCm !== undefined) dbUpdates.width_cm = updates.widthCm;
    if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
    if (updates.leadTimeDays !== undefined) dbUpdates.lead_time_days = updates.leadTimeDays;
    if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
    if (updates.certifications !== undefined) dbUpdates.certifications = updates.certifications;
    if (updates.sustainable !== undefined) dbUpdates.sustainable = updates.sustainable;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.stockMetres !== undefined) dbUpdates.stock_metres = updates.stockMetres;

    const { data, error } = await supabase
      .from("products")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    
    // Re-index product embedding in background
    import("./ai-service").then(({ aiService }) => {
      aiService.indexProduct(id);
    }).catch((err) => console.error("AI product indexing trigger failed:", err));

    return this.mapProduct(data);
  },

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  // 2. SUPPLIERS
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*");

      if (error) throw error;
      const dbSups = (data || []).map((s) => this.mapSupplier(s));
      
      // Combine database suppliers and mock suppliers, avoiding duplicate IDs
      const merged = [...dbSups];
      for (const ms of mockSuppliers) {
        if (!merged.some((s) => s.id === ms.id)) {
          merged.push(ms);
        }
      }
      return merged;
    } catch (err) {
      console.warn("Supabase fetch suppliers failed, falling back to mock data:", err);
    }
    return mockSuppliers;
  },

  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return this.mapSupplier(data);
      }
    } catch (err) {
      console.warn(`Supabase fetch supplier ${id} failed, falling back to mock data:`, err);
    }
    return mockSuppliers.find((s) => s.id === id) || null;
  },

  async updateSupplierProfile(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.country !== undefined) dbUpdates.country = updates.country;
    if (updates.since !== undefined) dbUpdates.since = updates.since;
    if (updates.about !== undefined) dbUpdates.about = updates.about;
    if (updates.hours !== undefined) dbUpdates.hours = updates.hours;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.categories !== undefined) dbUpdates.categories = updates.categories;
    if (updates.certificates !== undefined) dbUpdates.certificates = updates.certificates;

    const { data, error } = await supabase
      .from("suppliers")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return this.mapSupplier(data);
  },

  // 3. CART PERSISTENCE
  async getCartItems(userId: string): Promise<{ productId: string; metres: number; colour: string }[]> {
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("product_id, metres, colour")
        .eq("user_id", userId);

      if (error) throw error;
      return (data || []).map((item) => ({
        productId: item.product_id,
        metres: item.metres,
        colour: item.colour,
      }));
    } catch (err) {
      console.error("Failed to load cart from Supabase:", err);
      return [];
    }
  },

  async syncCartItem(userId: string, productId: string, metres: number, colour: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("cart_items")
        .upsert({
          user_id: userId,
          product_id: productId,
          metres,
          colour,
        }, { onConflict: "user_id,product_id,colour" });

      if (error) throw error;
    } catch (err) {
      console.error("Failed to sync cart item to Supabase:", err);
    }
  },

  async removeCartItem(userId: string, productId: string, colour?: string): Promise<void> {
    try {
      let query = supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);

      if (colour) {
        query = query.eq("colour", colour);
      }

      const { error } = await query;
      if (error) throw error;
    } catch (err) {
      console.error("Failed to remove cart item from Supabase:", err);
    }
  },

  async clearCart(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    } catch (err) {
      console.error("Failed to clear cart in Supabase:", err);
    }
  },

  // 4. ORDERS
  async getOrdersByBuyer(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", userId)
        .order("placed_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((o) => this.mapOrder(o));
    } catch (err) {
      console.warn("Supabase fetch buyer orders failed, falling back to in-memory orders:", err);
    }
    return inMemoryOrders.filter((o) => o.buyerId === userId);
  },

  async getOrdersBySupplier(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("supplier_id", userId)
        .order("placed_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((o) => this.mapOrder(o));
    } catch (err) {
      console.warn("Supabase fetch supplier orders failed, falling back to in-memory orders:", err);
    }
    return inMemoryOrders.filter((o) => o.supplierId === userId);
  },

  async createOrder(orderData: {
    buyerId: string;
    supplierId: string;
    productId: string;
    productName: string;
    colour: string;
    qty: number;
    unitPrice: number;
    totalAmount: number;
    shippingAddress: string;
  }): Promise<any> {
    try {
      const dbOrder = {
        buyer_id: orderData.buyerId,
        supplier_id: orderData.supplierId,
        product_id: orderData.productId,
        product_name: orderData.productName,
        colour: orderData.colour,
        qty: orderData.qty,
        unit_price: orderData.unitPrice,
        total_amount: orderData.totalAmount,
        shipping_address: orderData.shippingAddress,
        eta_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { data, error } = await supabase
        .from("orders")
        .insert(dbOrder)
        .select()
        .single();

      if (error) throw error;

      // UPDATE INVENTORY: Deduct qty from product stock in Supabase
      try {
        const product = await this.getProductById(orderData.productId);
        if (product) {
          const newStock = Math.max(0, product.stockMetres - orderData.qty);
          await this.updateProduct(orderData.productId, { stockMetres: newStock });
        }
      } catch (invErr) {
        console.warn("Failed to update product inventory in Supabase:", invErr);
      }

      return this.mapOrder(data);
    } catch (err) {
      console.warn("Supabase createOrder failed, falling back to in-memory order:", err);
      const mockOrder = {
        id: Math.random().toString(36).substring(2, 9),
        buyerId: orderData.buyerId,
        supplierId: orderData.supplierId,
        productId: orderData.productId,
        product: orderData.productName,
        colour: orderData.colour,
        qty: orderData.qty,
        total: orderData.totalAmount,
        status: "Pending",
        placed: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }),
        eta: "ETA " + new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }),
      };
      inMemoryOrders.push(mockOrder);

      // Deduct stock in local mockProducts list
      const mockProduct = mockProducts.find((p) => p.id === orderData.productId);
      if (mockProduct) {
        mockProduct.stockMetres = Math.max(0, mockProduct.stockMetres - orderData.qty);
      }

      return mockOrder;
    }
  },

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return this.mapOrder(data);
    } catch (err: any) {
      console.error("Supabase updateOrderStatus failed:", err);
      const match = inMemoryOrders.find((o) => o.id === orderId);
      if (match) {
        match.status = status;
        return match;
      }
      throw err;
    }
  },

  // 5. MAP PERSISTENCE DTOs TO frontend interfaces
  mapProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      subtitle: dbProduct.subtitle,
      material: dbProduct.material,
      composition: dbProduct.composition,
      image: dbProduct.image_url,
      gallery: dbProduct.gallery_urls && dbProduct.gallery_urls.length > 0 ? dbProduct.gallery_urls : [dbProduct.image_url],
      pricePerMetre: Number(dbProduct.price_per_metre),
      currency: dbProduct.currency || "₹",
      moq: dbProduct.moq,
      gsm: dbProduct.gsm,
      widthCm: dbProduct.width_cm,
      colors: typeof dbProduct.colors === "string" ? JSON.parse(dbProduct.colors) : dbProduct.colors,
      supplierId: dbProduct.supplier_id,
      rating: Number(dbProduct.rating || 5.0),
      reviews: dbProduct.reviews_count || 0,
      leadTimeDays: dbProduct.lead_time_days,
      availability: dbProduct.availability as Availability,
      certifications: dbProduct.certifications || [],
      sustainable: dbProduct.sustainable,
      tags: dbProduct.tags || [],
      description: dbProduct.description,
      stockMetres: dbProduct.stock_metres,
    };
  },

  mapSupplier(dbSupplier: any): Supplier {
    return {
      id: dbSupplier.id,
      name: dbSupplier.name,
      city: dbSupplier.city,
      country: dbSupplier.country,
      since: dbSupplier.since || 2020,
      verified: dbSupplier.verified,
      rating: Number(dbSupplier.rating || 5.0),
      orders: dbSupplier.orders_count || 0,
      responseHours: dbSupplier.response_hours || 24,
      categories: dbSupplier.categories || [],
      certificates: dbSupplier.certificates || [],
      about: dbSupplier.about || "",
      hours: dbSupplier.hours || "Mon–Fri · 09:00–18:00 Local",
      email: dbSupplier.email || "contact@mill.com",
      phone: dbSupplier.phone || "",
    };
  },

  mapOrder(dbOrder: any): any {
    return {
      id: dbOrder.id,
      buyerId: dbOrder.buyer_id,
      supplierId: dbOrder.supplier_id,
      productId: dbOrder.product_id,
      product: dbOrder.product_name,
      colour: dbOrder.colour,
      qty: dbOrder.qty,
      total: Number(dbOrder.total_amount),
      status: dbOrder.status,
      shippingAddress: dbOrder.shipping_address,
      placed: new Date(dbOrder.placed_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      eta: dbOrder.eta_date
        ? "ETA " + new Date(dbOrder.eta_date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          })
        : "Pending",
    };
  }
};
