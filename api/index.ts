import express from "express";
import cors from "cors";
import { createClient } from '@supabase/supabase-js';
import { db } from "../server/db.js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gskufvyviaxetkwrhsgn.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdza3Vmdnl2aWF4ZXRrd3Joc2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjA1NTUsImV4cCI6MjA4ODczNjU1NX0.VmK75_KWJ7xVjxAovEZakfnWu2yBW1uGfJHvKAdHinU';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes

// 1. Products
app.get("/api/products", async (req, res) => {
  const { search, category, sort } = req.query;
  let query = supabase.from('products').select('*');

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (category && category !== 'Semua') {
    query = query.eq('category', category);
  }

  if (sort === 'termurah') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'termahal') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('id', { ascending: false });
  }

  try {
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Database error" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: "Product not found" });
  res.json(data);
});

// 2. Reviews
app.get("/api/products/:id/reviews", async (req, res) => {
  const { data, error } = await supabase.from('reviews').select('*').eq('product_id', req.params.id).order('created_at', { ascending: false });
  res.json(data || []);
});

app.post("/api/products/:id/reviews", async (req, res) => {
  const { userName, rating, comment } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  try {
    const { error } = await supabase.from('reviews').insert({
      id,
      product_id: req.params.id,
      user_name: userName || 'Anonim',
      rating,
      comment
    });
    if (error) throw error;
    
    // Update product rating and count
    const { data: reviews } = await supabase.from('reviews').select('rating').eq('product_id', req.params.id);
    if (reviews && reviews.length > 0) {
      const newRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      await supabase.from('products').update({ rating: newRating, reviews_count: reviews.length }).eq('id', req.params.id);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to add review" });
  }
});

// 3. Community Posts
app.get("/api/posts", async (req, res) => {
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
  res.json(data || []);
});

app.post("/api/posts", async (req, res) => {
  const { userName, content } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  try {
    const { error } = await supabase.from('posts').insert({
      id, user_name: userName || 'Anonim', content
    });
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to add post" });
  }
});

// 4. Orders
app.get("/api/orders", async (req, res) => {
  const { userId } = req.query;
  try {
    const { data: orders, error } = await supabase.from('orders').select('*').eq('user_id', userId || 'guest').order('created_at', { ascending: false });
    if (error) throw error;
    
    if (orders) {
      for (let order of orders) {
        const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
        order.items = items || [];
      }
    }
    res.json(orders || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch orders" });
  }
});

app.post("/api/orders", async (req, res) => {
  const { userId, total, items } = req.body;
  const id = Math.random().toString(36).substr(2, 9).toUpperCase();
  try {
    const { error: orderError } = await supabase.from('orders').insert({
      id, user_id: userId || 'guest', total, status: 'PAID'
    });
    if (orderError) throw orderError;

    const orderItems = items.map((item: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      order_id: id,
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image_url: item.image_url
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    res.json({ success: true, order_id: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create order" });
  }
});

// 5. Shops
app.get("/api/shops/:userId", async (req, res) => {
  try {
    // Try Supabase first
    const { data, error } = await supabase.from('shops').select('*').eq('user_id', req.params.userId).single();
    if (!error && data) return res.json(data);

    // Fallback to local SQLite
    console.log('Supabase fetch failed or no data, trying local SQLite for shop:', req.params.userId);
    const shop = db.prepare('SELECT * FROM shops WHERE user_id = ?').get(req.params.userId);
    res.json(shop || null);
  } catch (err: any) {
    console.error('Error fetching shop:', err);
    // Even if Supabase throws, try local SQLite
    try {
      const shop = db.prepare('SELECT * FROM shops WHERE user_id = ?').get(req.params.userId);
      return res.json(shop || null);
    } catch (sqliteErr) {
      res.status(500).json({ error: err.message || "Failed to fetch shop" });
    }
  }
});

app.post("/api/shops", async (req, res) => {
  const { userId, name, description } = req.body;
  console.log('POST /api/shops hit with:', { userId, name, description });
  const id = Math.random().toString(36).substr(2, 9);
  
  try {
    // Try Supabase first
    const { data, error } = await supabase.from('shops').insert({
      id, user_id: userId, name, description
    }).select().single();
    
    if (!error && data) {
      console.log('Shop created in Supabase:', data);
      // Also save to local SQLite for consistency
      try {
        db.prepare('INSERT INTO shops (id, user_id, name, description) VALUES (?, ?, ?, ?)').run(id, userId, name, description);
      } catch (e) { console.warn('Failed to sync to local SQLite:', e); }
      return res.json(data);
    }
    
    if (error) console.warn('Supabase insert failed, trying local SQLite:', error);
  } catch (err) {
    console.warn('Supabase insert exception, trying local SQLite:', err);
  }

  // Fallback to local SQLite
  try {
    db.prepare('INSERT INTO shops (id, user_id, name, description) VALUES (?, ?, ?, ?)').run(id, userId, name, description);
    const shop = { id, user_id: userId, name, description };
    console.log('Shop created in local SQLite:', shop);
    res.json(shop);
  } catch (err: any) {
    console.error('Local SQLite insert failed:', err);
    res.status(500).json({ error: err.message || "Failed to create shop" });
  }
});

// 6. Seller Dashboard
app.get("/api/seller/products", async (req, res) => {
  const { shopId } = req.query;
  if (!shopId) return res.status(400).json({ error: "Shop ID is required" });
  
  try {
    const { data, error } = await supabase.from('products').select('*').eq('shop_id', shopId);
    if (!error && data) return res.json(data);
    
    // Fallback
    const products = db.prepare('SELECT * FROM products WHERE shop_id = ?').all(shopId);
    res.json(products || []);
  } catch (err) {
    try {
      const products = db.prepare('SELECT * FROM products WHERE shop_id = ?').all(shopId);
      res.json(products || []);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
});

app.get("/api/seller/orders", async (req, res) => {
  const { shopId } = req.query;
  // In a real app, we'd filter orders by products belonging to this shop
  // For now, we'll just return all orders for simplicity or filter if we had shop_id on orders
  try {
    const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    if (orders) {
      for (let order of orders) {
        const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
        order.items = items || [];
      }
    }
    res.json(orders || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch seller orders" });
  }
});

app.put("/api/seller/orders/:id/status", async (req, res) => {
  const { status, resi } = req.body;
  try {
    const updateData: any = { status };
    if (resi) updateData.resi = resi;
    
    const { error } = await supabase.from('orders').update(updateData).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update order status" });
  }
});

app.post("/api/seller/products", async (req, res) => {
  const { name, description, price, category, image_url, shopId } = req.body;
  if (!shopId) return res.status(400).json({ error: "Shop ID is required" });
  const id = Math.random().toString(36).substr(2, 9);
  
  try {
    const { error } = await supabase.from('products').insert({
      id, name, description, price, 
      image_url: image_url || 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=800&auto=format&fit=crop', 
      category, shop_id: shopId
    });
    
    if (!error) {
      // Sync to local
      try {
        db.prepare('INSERT INTO products (id, name, description, price, image_url, category, shop_id) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
          id, name, description, price, image_url, category, shopId
        );
      } catch (e) {}
      return res.json({ success: true });
    }
  } catch (err) {}

  // Fallback
  try {
    db.prepare('INSERT INTO products (id, name, description, price, image_url, category, shop_id) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id, name, description, price, image_url, category, shopId
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to add product" });
  }
});

app.delete("/api/seller/products/:id", async (req, res) => {
  const { shopId } = req.query;
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id).eq('shop_id', shopId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete product" });
  }
});

// 6. Admin Dashboard Routes
app.get("/api/admin/stats", async (req, res) => {
  try {
    const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: products } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: orders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    
    res.json({
      users: users || 0,
      products: products || 0,
      orders: orders || 0
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch stats" });
  }
});

app.get("/api/admin/users", async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch users" });
  }
});

app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete user" });
  }
});

app.get("/api/admin/products", async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch products" });
  }
});

app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete product" });
  }
});

app.get("/api/admin/orders", async (req, res) => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch orders" });
  }
});

export default app;
