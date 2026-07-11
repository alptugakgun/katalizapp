# KatalizApp (Eğitim Koçu) - Proje Hafızası

## Mevcut Durum (Versiyon 2.0.1)
- Proje `Express.js`, `MongoDB` (Mongoose) ve `Socket.io` altyapısı ile çalışmaktadır.
- Android için `Capacitor` entegrasyonu vardır.
- Yapay Zeka desteği `@google/generative-ai` (Gemini) ile sağlanmıştır.

## Son Yapılan Değişiklikler (URL Yönlendirme Optimizasyonu)
- **Sorun:** Sayfalar arasındaki geçişlerde URL'lerde karmaşa yaşanıyordu ve `index.html` referanslarında kopuk link hissi vardı.
- **Çözüm (Clean URLs):**
  - `server.js` içerisine tüm HTML sayfaları için özel (uzantısız) route'lar (`app.get('/login', ...)` vb.) eklendi.
  - `public` klasöründeki tüm HTML ve JS dosyalarındaki `href="sayfa.html"` linkleri `href="/sayfa"` olarak değiştirildi.
  - `window.location.href='sayfa.html'` yönlendirmeleri `window.location.href='/sayfa'` yapısına güncellendi.
  - Artık site profesyonel bir SaaS ürünü gibi `.html` uzantısı olmadan, temiz URL'lerle çalışmaktadır.

## Sonraki Adımlar
- Kullanıcının talepleri doğrultusunda diğer geliştirmelere başlanacak.
