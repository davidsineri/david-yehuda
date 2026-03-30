import { useState } from 'react';
import { FileText, Send, Sparkles, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { generateFormalLetter } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function LetterGenerator() {
  const { user } = useAuth();
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    if (!recipient || !subject || !content) {
      alert('Mohon lengkapi semua kolom.');
      return;
    }

    setIsLoading(true);
    setGeneratedLetter('');
    setIsCopied(false);

    try {
      const senderName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Nama Pemohon';
      const result = await generateFormalLetter(recipient, subject, content, senderName);
      setGeneratedLetter(result);
    } catch (error) {
      console.error(error);
      alert('Gagal membuat surat. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-black uppercase tracking-[0.3em] rounded-full mb-4">
          PACE AI Assistant
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white italic uppercase tracking-tighter mb-4">
          GENERATOR <span className="text-emerald-600">SURAT RESMI</span>
        </h1>
        <p className="text-lg font-serif italic text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
          Buat draf surat permohonan, izin, atau proposal resmi untuk instansi pemerintah daerah dengan bantuan AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white dark:bg-stone-900 p-8 rounded-[32px] border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 h-fit">
          <h2 className="text-2xl font-black text-black dark:text-white italic uppercase mb-6">Detail Surat</h2>
          
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-widest">Tujuan Surat (Pejabat/Instansi)</label>
            <input 
              type="text" 
              value={recipient} 
              onChange={e => setRecipient(e.target.value)} 
              className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
              placeholder="Contoh: Kepala Dinas Pariwisata Provinsi Papua" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-widest">Perihal</label>
            <input 
              type="text" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
              placeholder="Contoh: Permohonan Izin Pameran UMKM" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-widest">Poin-poin Isi Surat</label>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none h-40 resize-none" 
              placeholder="Jelaskan secara singkat apa yang ingin disampaikan. Contoh: Kami dari komunitas pengrajin Noken ingin mengadakan pameran di alun-alun kota pada tanggal 10 bulan depan..."
            ></textarea>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-4 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Sparkles size={20} /> Buat Draf Surat
              </>
            )}
          </button>
        </div>

        {/* Result Section */}
        <div className="bg-white dark:bg-stone-900 p-8 rounded-[32px] border border-stone-200 dark:border-stone-800 shadow-sm min-h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-black dark:text-white italic uppercase">Hasil Draf</h2>
            {generatedLetter && (
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-emerald-600 transition-colors"
              >
                {isCopied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
                {isCopied ? 'Tersalin!' : 'Salin Teks'}
              </button>
            )}
          </div>

          <div className="flex-1 bg-stone-50 dark:bg-stone-950 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                <Loader2 size={40} className="animate-spin text-emerald-500" />
                <p className="font-serif italic animate-pulse">Menyusun tata bahasa resmi...</p>
              </div>
            ) : generatedLetter ? (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                <ReactMarkdown>{generatedLetter}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4 text-center">
                <FileText size={48} className="text-stone-300 dark:text-stone-700" />
                <p className="font-serif italic text-lg">Draf surat akan muncul di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
