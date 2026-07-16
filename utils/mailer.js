const nodemailer = require('nodemailer');

// GÜVENLİK: Bu bilgiler .env dosyasından okunmalıdır.
// Şablon olarak SMTP (örn: Gmail, SendGrid, Amazon SES) ayarları gösterilmiştir.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'ornek_email@gmail.com',
        pass: process.env.EMAIL_PASS || 'ornek_uygulama_sifresi' // Gmail için App Password kullanılmalıdır
    }
});

/**
 * Parola sıfırlama e-postası gönderme şablonu.
 * 
 * @param {string} aliciEmail - Şifresini sıfırlamak isteyen kullanıcının e-posta adresi
 * @param {string} isim - Kullanıcının adı (Öğrenci/Eğitmen)
 * @param {string} token - Üretilen güvenli (tek kullanımlık) token
 */
async function sifirlamaMailiGonder(aliciEmail, isim, token) {
    try {
        const mailOptions = {
            from: `"KatalizApp Destek" <${process.env.EMAIL_USER || 'ornek_email@gmail.com'}>`,
            to: aliciEmail,
            subject: 'KatalizApp - Parola Sıfırlama İsteği 🔒',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #3b82f6;">KatalizApp'e Hoş Geldin, ${isim}!</h2>
                    <p>Hesabının parolasını sıfırlamak için bir talepte bulunuldu.</p>
                    <p>Aşağıdaki güvenlik kodunu kullanarak veya doğrudan uygulamadaki parola sıfırlama ekranına girerek şifreni yenileyebilirsin:</p>
                    <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-left: 4px solid #10b981; font-size: 18px; font-weight: bold; letter-spacing: 2px;">
                        ${token}
                    </div>
                    <p style="color: #ef4444; font-size: 12px;"><strong>DİKKAT:</strong> Bu kod sadece 1 saat (60 dakika) boyunca geçerlidir ve tek kullanımlıktır. Eğer bu talebi sen yapmadıysan, bu mesajı görmezden gelebilirsin.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">KatalizApp Güvenlik Ekibi</p>
                </div>
            `
        };

        // Eğer .env içerisinde gerçek e-posta ayarları yoks, sadece logla (Şablon mantığı)
        if (!process.env.EMAIL_USER) {
            console.log(`\n📧 [SİMÜLASYON] E-posta gönderildi! Alıcı: ${aliciEmail} | Token: ${token}\n`);
            return true;
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 E-posta başarıyla gönderildi: ${info.messageId}`);
        return true;

    } catch (error) {
        console.error('🔴 E-posta Gönderme Hatası:', error);
        return false;
    }
}

module.exports = { sifirlamaMailiGonder };
