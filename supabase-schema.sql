-- Hapus tabel jika sudah ada (opsional, untuk reset)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- 1. Tabel Products
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  category TEXT,
  sellerId TEXT,
  rating REAL DEFAULT 0,
  reviewsCount INTEGER DEFAULT 0,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Tabel Reviews
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  productId TEXT REFERENCES products(id) ON DELETE CASCADE,
  userName TEXT,
  rating INTEGER,
  comment TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Tabel Posts (Komunitas)
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  userName TEXT,
  content TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Tabel Orders
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  userId TEXT,
  total INTEGER,
  status TEXT,
  resi TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Tabel Order Items
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  orderId TEXT REFERENCES orders(id) ON DELETE CASCADE,
  productId TEXT,
  name TEXT,
  price INTEGER,
  quantity INTEGER,
  image_url TEXT
);

-- 6. Tabel Users (Untuk Admin/KYC nantinya)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Masukkan Data Dummy Produk Awal
INSERT INTO products (id, name, description, price, image_url, category, sellerId, rating, reviewsCount) VALUES 
('p1', 'Noken Anggrek Asli Papua', 'Tas tradisional Papua yang dirajut dari serat kulit kayu dan anggrek. Sangat kuat dan tahan lama.', 350000, 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800&auto=format&fit=crop', 'Kriya & Kerajinan', 'seller1', 4.8, 24),
('p2', 'Kopi Arabika Wamena 250g', 'Kopi Arabika asli dari pegunungan Wamena. Ditanam secara organik di ketinggian 1.600 mdpl.', 850000, 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop', 'Makanan & Minuman', 'seller2', 4.9, 56),
('p3', 'Ukiran Kayu Asmat', 'Pajangan ukiran kayu khas suku Asmat, melambangkan roh leluhur. Dibuat dari kayu besi.', 1200000, 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=800&auto=format&fit=crop', 'Seni & Ukiran', 'seller1', 5.0, 12),
('p4', 'Kain Batik Motif Burung Cendrawasih', 'Kain batik tulis dengan motif khas burung Cendrawasih Papua. Bahan katun primisima.', 450000, 'https://images.unsplash.com/photo-1605001011155-2ee7b2b11225?q=80&w=800&auto=format&fit=crop', 'Fashion & Kain', 'seller3', 4.7, 18);
