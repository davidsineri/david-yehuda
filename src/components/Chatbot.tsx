import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithAgent } from '../services/aiService';
import ReactMarkdown from 'react-markdown';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Halo Kaka! Saya PACE AI, asisten virtual Anda. Ada yang bisa saya bantu tentang wisata atau produk lokal Papua hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch products context once
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch products for AI context', err));
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Pass previous messages as history (excluding the very first greeting if we want, but it's fine to include)
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await chatWithAgent(userMsg, history, products);
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Maaf, terjadi kesalahan saat menghubungi server. Silakan coba lagi nanti.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-emerald-700 transition-transform hover:scale-105 z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">PACE AI Assistant</h3>
                  <p className="text-[10px] text-emerald-100">Travel & Shopping Agent</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 dark:bg-stone-950">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-black text-white rounded-tr-sm' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-sm shadow-sm'}`}>
                    {msg.role === 'user' ? (
                      <p>{msg.text}</p>
                    ) : (
                      <div className="markdown-body prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-stone-100 dark:prose-pre:bg-stone-800">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                    <span className="text-xs text-stone-500">PACE AI sedang mengetik...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanya tentang wisata atau produk..."
                  className="flex-1 bg-stone-100 dark:bg-stone-800 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 dark:text-white outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center disabled:opacity-50 transition-transform active:scale-95"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
