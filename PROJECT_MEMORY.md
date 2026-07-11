# KatalizApp (Eğitim Koçu) - Proje Hafızası

## Mevcut Durum (Versiyon 2.0.2)
- Proje `Express.js`, `MongoDB` (Mongoose) ve `Socket.io` altyapısı ile çalışmaktadır.
- Android için `Capacitor` entegrasyonu vardır.
- Yapay Zeka desteği `@google/generative-ai` (Gemini) ile sağlanmıştır.

## Son Yapılan Değişiklikler
### SEO ve Google Görünürlüğü (v2.0.2)
- Tüm HTML sayfalarına kapsamlı Meta, Open Graph ve Twitter SEO etiketleri eklendi.
- Arama motoru botları için `public/robots.txt` dosyası oluşturuldu.
- Sitenin mimarisini belirten `public/sitemap.xml` eklendi.
- Google Search Console kaydına hazır hale getirildi.

### URL Yönlendirme Optimizasyonu (v2.0.1)
- Tüm sayfalarda Clean URL (`.html` uzantısı olmadan) yapısına geçildi.
- Service Worker (`sw.js`) v2 sürümüne güncellendi ve eski hatalı cache'i temizleme özelliği eklendi.

## Yapılacaklar Listesi / Hatırlatmalar (Yakında Başlanacaklar)
- [ ] Yapay Zeka (Gemini Asistan) ile ilgili yaşanan genel problemler çözülecek.
- [ ] Sistemdeki güvenlik açıkları ve Çerez (Cookie) politikaları düzenlenecek.
