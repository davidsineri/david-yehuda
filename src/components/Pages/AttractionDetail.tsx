import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, ArrowLeft, Share2, Heart } from 'lucide-react';
import { attractions } from '../../data/attractions';

export default function AttractionDetail() {
  const { id } = useParams<{ id: string }>();
  const attraction = attractions.find(a => a.id === id);

  if (!attraction) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-red-500 font-bold mb-4">Tempat wisata tidak ditemukan</p>
        <Link to="/wisata" className="text-emerald-600 hover:underline">Kembali ke Wisata</Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Editorial Hero Section */}
      <section className="relative h-[100vh] flex items-center justify-center text-center px-4 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src={attraction.image_url} 
            alt={attraction.name} 
            className="w-full h-full object-cover opacity-70"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to="/wisata" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-12 transition-colors uppercase tracking-[0.3em] text-xs font-black">
              <ArrowLeft size={16} /> Kembali ke Wisata
            </Link>
            <h1 className="text-[18vw] md:text-[14vw] font-black leading-[0.8] text-white uppercase tracking-tighter mb-8 italic">
              {attraction.name}
            </h1>
            <div className="flex items-center justify-center gap-4 text-white/80">
              <MapPin size={20} className="text-emerald-500" />
              <span className="text-xl md:text-2xl font-black uppercase tracking-widest italic">{attraction.location}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story Content */}
      <section className="max-w-4xl mx-auto px-4 -mt-24 relative z-20">
        <div className="bg-white dark:bg-stone-900 p-12 md:p-20 rounded-[60px] shadow-2xl border border-stone-100 dark:border-stone-800">
          <div className="flex justify-between items-center mb-12">
             <span className="px-6 py-2 bg-stone-100 dark:bg-stone-800 text-black dark:text-white text-xs font-black uppercase tracking-[0.3em] rounded-full">
              {attraction.category}
            </span>
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-full border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-500 transition-all">
                <Heart size={20} />
              </button>
              <button className="w-12 h-12 rounded-full border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 hover:text-emerald-500 hover:border-emerald-500 transition-all">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <h2 className="text-4xl font-black text-black dark:text-white italic mb-8 uppercase tracking-tighter">CERITA DI BALIKNYA</h2>
          
          <div className="space-y-8">
            <p className="text-2xl font-serif italic text-stone-800 dark:text-stone-200 leading-relaxed first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-emerald-600">
              {attraction.story}
            </p>
            <p className="text-xl text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
              {attraction.description}
            </p>
          </div>

          <div className="mt-20 pt-12 border-t border-stone-100 dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              </div>
              <div>
                <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Status</p>
                <p className="text-lg font-bold text-black dark:text-white">Destinasi Terverifikasi</p>
              </div>
            </div>
            <Link to="/" className="nike-button px-12">Jelajahi Produk Lokal</Link>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 mt-32">
         <h3 className="text-3xl font-black text-black dark:text-white italic mb-12 uppercase tracking-tighter text-center">GALERI VISUAL</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">
            <div className="rounded-[40px] overflow-hidden">
               <img src={attraction.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="grid grid-rows-2 gap-8">
               <div className="rounded-[40px] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1544441893-675973e31d85?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </div>
               <div className="rounded-[40px] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
