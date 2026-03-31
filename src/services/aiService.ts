import { GoogleGenAI } from "@google/genai";
import { attractions } from "../data/attractions";

// Helper to get AI instance with current API key
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta.env && (import.meta.env as any).VITE_GEMINI_API_KEY) || '';
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing. Please check your environment variables.");
  } else {
    console.log(`GEMINI_API_KEY found: ${apiKey.substring(0, 4)}...`);
  }
  return new GoogleGenAI({ apiKey });
};

const RAJAONGKIR_CITIES = [
  { city_id: '154', city_name: 'Jayapura', type: 'Kota' },
  { city_id: '151', city_name: 'Jakarta Pusat', type: 'Kota' },
  { city_id: '444', city_name: 'Surabaya', type: 'Kota' },
  { city_id: '23', city_name: 'Bandung', type: 'Kota' },
  { city_id: '210', city_name: 'Makassar', type: 'Kota' },
  { city_id: '430', city_name: 'Sorong', type: 'Kota' },
  { city_id: '278', city_name: 'Medan', type: 'Kota' },
  { city_id: '327', city_name: 'Palembang', type: 'Kota' },
  { city_id: '17', city_name: 'Balikpapan', type: 'Kota' },
  { city_id: '292', city_name: 'Merauke', type: 'Kabupaten' },
  { city_id: '293', city_name: 'Mimika', type: 'Kabupaten' }
];

export async function generateProductDescription(base64Image: string): Promise<string> {
  if (!base64Image) return '';
  
  const ai = getAI();
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
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Anda adalah asisten ahli pengemasan dan pengiriman barang untuk penjual online. Berikan saran yang aman, efisien, dan ramah lingkungan untuk pertanyaan berikut: ${question}`,
  });
  
  return response.text || 'Maaf, saya tidak dapat memberikan saran saat ini.';
}

export async function chatWithAgent(message: string, history: {role: string, text: string}[] = [], productsContext: any[] = []): Promise<string> {
  const ai = getAI();
  const systemInstruction = `Anda adalah "PACE Multi-Agent AI", asisten virtual cerdas untuk aplikasi e-commerce dan pariwisata Papua bernama PACE.
Anda memiliki 3 persona/agen yang bekerja sama:
1. Agen Pariwisata: Ahli merekomendasikan destinasi wisata Papua, menyusun itinerary, dan memberikan tips perjalanan.
2. Agen Belanja: Ahli merekomendasikan produk lokal UMKM Papua (kopi, noken, ukiran, dll).
3. Agen Support: Membantu navigasi aplikasi dan pertanyaan umum.

Konteks Destinasi Wisata yang tersedia:
${attractions.map(a => `- ${a.name} (${a.location}): ${a.category}`).join('\n')}

Konteks Produk Lokal yang tersedia:
${productsContext.map(p => `- ${p.name} (Rp ${p.price}): ${p.category}`).join('\n')}

Konteks Pengiriman (RajaOngkir) yang tersedia:
Aplikasi mendukung pengiriman dari Jayapura ke kota-kota berikut:
${RAJAONGKIR_CITIES.map(c => `- ${c.type} ${c.city_name}`).join('\n')}

Tugas Anda:
- Jawab pertanyaan pengguna dengan ramah, antusias, dan menggunakan bahasa Indonesia yang baik (boleh diselingi sapaan khas Papua seperti "Pace", "Mace", "Kaka").
- Jika pengguna mencari produk/wisata, rekomendasikan dari daftar konteks di atas.
- Jika pengguna meminta itinerary, buatkan rencana perjalanan yang menarik dan sertakan rekomendasi produk lokal untuk oleh-oleh.
- Jika pengguna bertanya tentang pengiriman, informasikan bahwa PACE mendukung pengiriman ke kota-kota besar di Indonesia melalui JNE, POS, dan TIKI.
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
  const ai = getAI();
  const systemInstruction = `Anda adalah "PACE Travel Planner AI", ahli perencana perjalanan khusus untuk destinasi Papua.
Buatkan itinerary (rencana perjalanan) yang detail, menarik, dan realistis berdasarkan input pengguna.
Sertakan rekomendasi destinasi wisata dari daftar berikut jika relevan:
${attractions.map(a => `- ${a.name} (${a.location})`).join('\n')}

Informasi Tambahan:
- PACE mendukung pengiriman oleh-oleh langsung ke kota asal pengguna (seperti ${RAJAONGKIR_CITIES.slice(1, 5).map(c => c.city_name).join(', ')}, dll) melalui integrasi RajaOngkir.
- Beritahu pengguna bahwa mereka bisa berbelanja oleh-oleh di aplikasi PACE dan barang akan dikirim dengan aman.

Sertakan juga rekomendasi oleh-oleh produk lokal Papua di hari terakhir.
Gunakan format Markdown yang rapi dengan heading, bullet points, dan estimasi biaya (opsional).`;

  const prompt = `Tolong buatkan itinerary liburan ke Papua dengan detail berikut:
- Durasi: ${days} hari
- Minat/Gaya Liburan: ${interests}
- Budget: ${budget}

Buat rencana per hari (Hari 1, Hari 2, dst) yang mencakup aktivitas, destinasi, dan rekomendasi kuliner/oleh-oleh.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    if (!response.text) {
      console.error("Gemini API returned empty response:", response);
      throw new Error("Empty response from AI");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error in generateTravelItinerary:", error);
    throw error;
  }
}

export async function smartSearchProducts(query: string, products: any[]): Promise<any[]> {
  if (!query || products.length === 0) return products;

  const ai = getAI();
  const systemInstruction = `Anda adalah mesin pencari cerdas untuk e-commerce produk Papua bernama PACE.
Tugas Anda adalah menerima query pencarian dari pengguna (yang mungkin berupa kalimat, konteks, atau deskripsi tidak langsung) dan mengembalikan daftar ID produk yang paling relevan dari katalog yang diberikan.
Katalog Produk:
${products.map(p => `ID: ${p.id} | Nama: ${p.name} | Kategori: ${p.category} | Deskripsi: ${p.description}`).join('\n')}

Output HARUS berupa array JSON berisi ID produk yang relevan, diurutkan dari yang paling relevan. Contoh output: ["id1", "id2"]. Jangan tambahkan teks lain selain array JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Query pencarian: "${query}"`,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || '[]';
    const matchedIds = JSON.parse(resultText);
    
    if (Array.isArray(matchedIds) && matchedIds.length > 0) {
      // Return products that match the IDs, maintaining the order returned by AI
      return matchedIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    }
    return []; // No matches found by AI
  } catch (error) {
    console.error("Smart search failed:", error);
    // Fallback to basic text search if AI fails
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.description.toLowerCase().includes(lowerQuery)
    );
  }
}
