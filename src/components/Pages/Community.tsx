import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Heart, Share2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) setPosts(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    if (!user) {
      alert('Silakan login untuk memposting.');
      return;
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newPost, 
          userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User' 
        })
      });
      if (res.ok) {
        setNewPost('');
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-black text-black italic mb-4">KOMUNITAS PACE</h1>
      <p className="text-xl text-stone-500 font-medium mb-12">Bagikan cerita, inspirasi, dan dukungan Anda untuk UMKM Papua.</p>

      <form onSubmit={handlePost} className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-sm mb-12">
        <textarea 
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Apa yang ingin Anda bagikan hari ini?"
          className="w-full bg-stone-50 p-6 rounded-2xl border-none focus:ring-2 focus:ring-black resize-none h-32 mb-4"
        ></textarea>
        <div className="flex justify-end">
          <button type="submit" className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-stone-800 transition-colors">
            Kirim Postingan
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-stone-500">Memuat postingan...</div>
        ) : (
          posts.map((post, index) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center font-bold text-stone-500">
                  {post.userName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{post.userName}</h4>
                  <p className="text-sm text-stone-400">{new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <p className="text-stone-700 text-lg leading-relaxed mb-6">{post.content}</p>
              <div className="flex gap-6 border-t border-stone-100 pt-4">
                <button className="flex items-center gap-2 text-stone-500 hover:text-red-500 transition-colors font-medium">
                  <Heart size={20} /> Suka
                </button>
                <button className="flex items-center gap-2 text-stone-500 hover:text-blue-500 transition-colors font-medium">
                  <MessageSquare size={20} /> Komentar
                </button>
                <button className="flex items-center gap-2 text-stone-500 hover:text-emerald-500 transition-colors font-medium">
                  <Share2 size={20} /> Bagikan
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
