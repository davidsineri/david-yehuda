import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { Product } from '../../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      setLoading(true);
      try {
        const [productRes, reviewsRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch(`/api/products/${id}/reviews`)
        ]);

        if (!productRes.ok) throw new Error('Produk tidak ditemukan');
        
        const productData = await productRes.json();
        const reviewsData = reviewsRes.ok ? await reviewsRes.json() : [];

        setProduct(productData);
        setReviews(reviewsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductAndReviews();
  }, [id]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-24 text-center">Memuat produk...</div>;
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-red-500 font-bold mb-4">{error || 'Produk tidak ditemukan'}</p>
        <Link to="/" className="text-emerald-600 hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-black mb-8 transition-colors">
        <ArrowLeft size={20} />
        <span className="font-bold">Kembali ke Katalog</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        {/* Product Image */}
        <div className="aspect-square rounded-[40px] overflow-hidden bg-stone-100">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-1.5 bg-stone-100 text-stone-600 text-xs font-black uppercase tracking-[0.2em] rounded-full mb-4">
              {product.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-black italic mb-4">{product.name}</h1>
            <p className="text-3xl font-black text-emerald-600 mb-6">Rp {product.price.toLocaleString('id-ID')}</p>
            <p className="text-stone-600 leading-relaxed text-lg">{product.description}</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 bg-stone-100 px-6 py-3 rounded-full">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="font-bold text-xl">-</button>
                <span className="font-black w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="font-bold text-xl">+</button>
              </div>
              <p className="text-sm font-bold text-stone-400">Stok: {product.stock > 0 ? product.stock : 'Tersedia'}</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  for (let i = 0; i < quantity; i++) addToCart(product);
                  alert('Berhasil ditambahkan ke keranjang!');
                }}
                className="flex-1 bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                Tambah ke Keranjang
              </button>
              <button 
                onClick={() => {
                  if (isInWishlist(product.id)) removeFromWishlist(product.id);
                  else addToWishlist(product);
                }}
                className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isInWishlist(product.id) 
                    ? 'border-red-500 bg-red-50 text-red-500' 
                    : 'border-stone-200 text-stone-400 hover:border-black hover:text-black'
                }`}
              >
                <Heart size={24} className={isInWishlist(product.id) ? 'fill-current' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-stone-100 pt-16">
        <h3 className="text-3xl font-black text-black italic mb-8">ULASAN PELANGGAN</h3>
        
        {reviews.length === 0 ? (
          <div className="bg-stone-50 rounded-[32px] p-8 text-center border border-stone-100">
            <p className="text-stone-500 font-medium">Belum ada ulasan untuk produk ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-stone-200 p-6 rounded-[24px]">
                <div className="flex items-center gap-2 mb-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < review.rating ? 'fill-current' : 'text-stone-200'} />
                  ))}
                </div>
                <p className="text-stone-700 mb-4">"{review.comment}"</p>
                <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">{review.userName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
