import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'database.sqlite');
export const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    price INTEGER,
    image_url TEXT,
    category TEXT,
    sellerId TEXT,
    stock INTEGER DEFAULT 10,
    rating REAL DEFAULT 0,
    reviewsCount INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    productId TEXT,
    userName TEXT,
    rating INTEGER,
    comment TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    userName TEXT,
    content TEXT,
    likes INTEGER DEFAULT 0,
    commentsCount INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT,
    total INTEGER,
    status TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    orderId TEXT,
    productId TEXT,
    name TEXT,
    price INTEGER,
    quantity INTEGER,
    image_url TEXT
  );
`);

// Seed data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (count.count === 0) {
  const insertProduct = db.prepare('INSERT INTO products (id, name, description, price, image_url, category, sellerId, rating, reviewsCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  const initialProducts = [
    {
      id: '1',
      name: 'Noken Anggrek Asli',
      description: 'Tas tradisional Papua yang dianyam dari serat kulit kayu dan anggrek hutan. Sangat kuat dan elastis, cocok untuk membawa barang sehari-hari dengan gaya etnik yang elegan.',
      price: 450000,
      image_url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=800&auto=format&fit=crop',
      category: 'Kriya',
      sellerId: 'seller1',
      rating: 4.8,
      reviewsCount: 24
    },
    {
      id: '2',
      name: 'Kopi Arabika Tiom',
      description: 'Kopi Arabika spesialti dari pegunungan Tiom, Lanny Jaya. Ditanam di ketinggian 2000 mdpl, menghasilkan cita rasa fruity yang khas dengan body yang tebal.',
      price: 120000,
      image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
      category: 'Hasil Bumi',
      sellerId: 'seller2',
      rating: 4.9,
      reviewsCount: 56
    },
    {
      id: '3',
      name: 'Ukiran Kayu Asmat',
      description: 'Patung ukiran tangan asli dari suku Asmat. Terbuat dari kayu besi pilihan dengan detail ukiran yang menceritakan mitologi leluhur.',
      price: 1250000,
      image_url: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?q=80&w=800&auto=format&fit=crop',
      category: 'Seni',
      sellerId: 'seller3',
      rating: 5.0,
      reviewsCount: 12
    },
    {
      id: '4',
      name: 'Kain Tenun Port Numbay',
      description: 'Kain tenun motif khas Jayapura (Port Numbay) dengan pewarna alami. Cocok untuk dijadikan pakaian formal atau dekorasi ruangan.',
      price: 850000,
      image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop',
      category: 'Fashion',
      sellerId: 'seller1',
      rating: 4.7,
      reviewsCount: 18
    }
  ];

  for (const p of initialProducts) {
    insertProduct.run(p.id, p.name, p.description, p.price, p.image_url, p.category, p.sellerId, p.rating, p.reviewsCount);
  }

  // Seed some community posts
  const insertPost = db.prepare('INSERT INTO posts (id, userName, content, likes, commentsCount) VALUES (?, ?, ?, ?, ?)');
  insertPost.run('p1', 'Yohanes', 'Baru saja menerima Noken pesanan saya. Kualitas anyamannya luar biasa rapi! Bangga pakai produk lokal Papua.', 12, 3);
  insertPost.run('p2', 'Maria', 'Ada yang tau pengrajin ukiran Asmat yang bisa custom ukuran? Saya butuh untuk dekorasi cafe.', 5, 8);
}
