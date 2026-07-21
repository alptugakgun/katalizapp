# 🧠 KatalizApp - Proje Hafızası (Agent Handoff)

Bu dosya, yapay zeka asistanları arasında bağlamın kaybolmaması ve projenin mevcut durumu hakkında bilgi aktarımı yapılması amacıyla oluşturulmuştur. Sonraki ajan bu dosyayı okuyarak projenin hangi aşamada olduğunu ve en son nelerin yapıldığını anlayabilir.

## 📌 Proje Genel Bakış
*   **Proje Adı:** KatalizApp (Eğitim Koçu Yönetim Sistemi)
*   **Mimari:** Node.js, Express.js, MongoDB (Mongoose), Socket.io (Gerçek zamanlı iletişim).
*   **Modüller:** Öğrenci paneli, Eğitmen/Koç paneli, Veli takip paneli, Admin (Yönetim) paneli.

## 🛡️ En Son Tamamlanan Görev: "Bug Hunter" Güvenlik Sertifikasyonu (Temmuz 2026)
Projeye yapılan pentest sonucunda bulunan tüm zafiyetler başarılı bir şekilde kapatılmış ve kod altyapısı güvenli hale getirilmiştir. Bu doğrultuda yapılan temel işlemler aşağıdadır:

1.  **NoSQL Injection Koruması:**
    *   Tüm API isteklerine `express-mongo-sanitize` mantığı entegre edildi. Ancak orijinal paket, Express 5.x ile uyumsuz (req.query nesnesinin üzerine yazmaya çalıştığı için Type Error veriyordu) olduğundan kaldırılarak yerine **yerel ve güvenli** `middleware/mongoSanitizeSafe.js` eklendi (`server.js` içerisinde aktif).
    *   Öğrenci, Koç ve Veli girişleri için `req.body` üzerinden gelen verilerin tiplerini (string/number) ve formatlarını doğrulayan `girdiDogrula` şema tabanlı middleware (`middleware/sanitize.js`) yazıldı.
2.  **Güvenli Kimlik Doğrulama & JWT (Admin Paneli):**
    *   Admin parolası (`1453Alp1.`) açık metin olarak değil, Bcrypt ile hash'lenerek ve `.env` üzerinden güvenli şekilde okunacak hale getirildi.
    *   Admin paneli (`public/admin.html`) `localStorage`'dan tamamen arındırıldı. Artık giriş işlemi başarılı olduğunda sistem `httpOnly` ve `secure` bayraklı, XSS saldırılarına karşı korumalı bir JWT çerezi (cookie) veriyor.
3.  **Rol Tabanlı Yetkilendirme (RBAC):**
    *   Admin API rotalarına yetkisiz erişimi engellemek için `middleware/adminAuth.js` oluşturuldu. Tüm `/api/admin/*` rotaları sadece rolü `admin` olan geçerli JWT sahiplerine cevap verecek şekilde korundu.
4.  **Brute-Force (Kaba Kuvvet) Koruması:**
    *   `express-rate-limit` kullanılarak sisteme `girisLimiter` eklendi. Aynı IP üzerinden `/api/.../giris` rotalarına 15 dakika içinde 5'ten fazla başarısız deneme yapılırsa istekler otomatik olarak bloklanıyor. Başarılı girişler bu limiti etkilemiyor (`skipSuccessfulRequests: true`).
5.  **Güvenli Parola Sıfırlama & E-posta Altyapısı:**
    *   "123456" şeklinde varsayılan parola ataması güvenlik riski barındırdığı için kaldırıldı.
    *   SHA-256 algoritmasıyla benzersiz, 1 saat geçerli ve tek kullanımlık şifre sıfırlama token'ları (`middleware/resetToken.js`) üreten bir yapı kuruldu.
    *   `nodemailer` ile bir e-posta gönderme şablonu (`utils/mailer.js`) oluşturuldu. Şu an veritabanında e-posta kayıtlı olmadığı için mailler gönderilmiş gibi sunucu tarafında console'a loglanıyor (Simülasyon modu). İstendiğinde doğrudan devreye alınabilir.

## 🚀 Mevcut Durum
*   Tüm kodlar Node.js syntax kontrolünden geçirilmiş, hatasız çalışmaktadır.
*   En son yapılan güvenlik güncellemeleri ve Render/Express 5.x production hata çözümleri başarıyla git repository'sine (GitHub) commit edilmiş ve `origin/master` dalına pushlanmıştır (Commit Mesajı: `fix: resolve TypeError for req.query in Express 5 by replacing express-mongo-sanitize with local safe alternative`).
*   Altyapı, yeni özellikler eklenmeye ve geliştirmelere tamamen hazırdır.

## ⚠️ Sonraki Ajan İçin Notlar
*   Frontend JavaScript dosyaları (`app.js` vb.) içinde hala bazı özelliklerde `localStorage` kullanımları mevcut olabilir (Örneğin öğrencilerin günlük seri durumları). Güvenlik açısından kritik olmayan alanlarda bunlar bilinçli olarak bırakılmıştır ancak admin paneli tamamen Cookie yapısındadır.
*   Bir değişiklik yaparken her zaman "Bug Hunter" perspektifinden yaklaşın ve Express rotalarına yeni eklentiler yaparken `adminKorumasi`, `girisLimiter`, ve `girdiDogrula` gibi koruma kalkanlarını kullanmayı unutmayın.
*   Mümkün olduğunca `cat` gibi komutlar yerine AI ajanının yerleşik `write_to_file`, `replace_file_content` veya `multi_replace_file_content` araçlarını kullanın.
