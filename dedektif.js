require('dotenv').config();

console.log("🔍 Google'ın kapısı çalınıyor...");

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`)
    .then(res => res.json())
    .then(data => {
        if(data.error) {
            console.log("🚨 API Hatası:", data.error.message);
        } else {
            console.log("✅ Senin API Anahtarına Tanımlı Açık Modeller Şunlar:");
            data.models.forEach(m => {
                // Sadece metin üretebilen modelleri listele
                if(m.supportedGenerationMethods.includes('generateContent')) {
                    console.log("->", m.name.replace('models/', '')); 
                }
            });
            console.log("\n💡 ÇÖZÜM: Yukarıdaki listeden gözüne kestirdiğin modeli kopyala ve server.js içindeki { model: '...' } kısmına yapıştır.");
        }
    })
    .catch(err => console.error("Hata oluştu:", err));