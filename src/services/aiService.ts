import { GoogleGenAI } from "@google/genai";
import { attractions } from "../data/attractions";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateProductDescription(base64Image: string): Promise<string> {
  if (!base64Image) return '';
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: 'image/jpeg',
          },
        },
        {
          text: 'Buatkan deskripsi produk yang profesional, menarik, dan informatif untuk produk ini. Gunakan bahasa Indonesia yang santun dan menggugah minat pembeli. Fokus pada keunikan produk khas Papua.',
        },
      ],
    },
  });
  
  return response.text || 'Deskripsi tidak dapat dibuat.';
}

export async function getPackagingAdvice(question: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Anda adalah asisten ahli pengemasan dan pengiriman barang untuk penjual online. Berikan saran yang aman, efisien, dan ramah lingkungan untuk pertanyaan berikut: ${question}`,
  });
  
  return response.text || 'Maaf, saya tidak dapat memberikan saran saat ini.';
}

export async function chatWithAgent(message: string, history: {role: string, text: string}[] = [], productsContext: any[] = []): Promise<string> {
  const systemInstruction = `Anda adalah "PACE Multi-Agent AI", asisten virtual cerdas untuk aplikasi e-commerce dan pariwisata Papua bernama PACE.
Anda memiliki 3 persona/agen yang bekerja sama:
1. Agen Pariwisata: Ahli merekomendasikan destinasi wisata Papua, menyusun itinerary, dan memberikan tips perjalanan.
2. Agen Belanja: Ahli merekomendasikan produk lokal UMKM Papua (kopi, noken, ukiran, dll).
3. Agen Support: Membantu navigasi aplikasi dan pertanyaan umum.

Konteks Destinasi Wisata yang tersedia:
${attractions.map(a => `- ${a.name} (${a.location}): ${a.category}`).join('\n')}

Konteks Produk Lokal yang tersedia:
${productsContext.map(p => `- ${p.name} (Rp ${p.price}): ${p.category}`).join('\n')}

Tugas Anda:
- Jawab pertanyaan pengguna dengan ramah, antusias, dan menggunakan bahasa Indonesia yang baik (boleh diselingi sapaan khas Papua seperti "Pace", "Mace", "Kaka").
- Jika pengguna mencari produk/wisata, rekomendasikan dari daftar konteks di atas.
- Jika pengguna meminta itinerary, buatkan rencana perjalanan yang menarik dan sertakan rekomendasi produk lokal untuk oleh-oleh.
- Format jawaban menggunakan Markdown agar rapi (gunakan bullet points, bold, dll).`;

  const contents: any[] = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.text }]
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents,
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  return response.text || 'Maaf, saya sedang mengalami gangguan jaringan. Bisa ulangi pertanyaannya?';
}

export async function generateTravelItinerary(days: number, interests: string, budget: string): Promise<string> {
  const systemInstruction = `Anda adalah "PACE Travel Planner AI", ahli perencana perjalanan khusus untuk destinasi Papua.
Buatkan itinerary (rencana perjalanan) yang detail, menarik, dan realistis berdasarkan input pengguna.
Sertakan rekomendasi destinasi wisata dari daftar berikut jika relevan:
${attractions.map(a => `- ${a.name} (${a.location})`).join('\n')}

Sertakan juga rekomendasi oleh-oleh produk lokal Papua di hari terakhir.
Gunakan format Markdown yang rapi dengan heading, bullet points, dan estimasi biaya (opsional).`;

  const prompt = `Tolong buatkan itinerary liburan ke Papua dengan detail berikut:
- Durasi: ${days} hari
- Minat/Gaya Liburan: ${interests}
- Budget: ${budget}

Buat rencana per hari (Hari 1, Hari 2, dst) yang mencakup aktivitas, destinasi, dan rekomendasi kuliner/oleh-oleh.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  return response.text || 'Maaf, saya gagal membuat itinerary saat ini. Silakan coba lagi.';
}
