// ==========================================
// ADMIN GİRİŞ CONTROLLER (JWT + httpOnly Cookie)
// ==========================================
// Güvenlik: Admin parolası bcrypt ile hash'lenmiş olarak .env'de tutulur.
// Başarılı girişte JWT üretilir ve httpOnly + Secure + SameSite=Strict cookie olarak istemciye gönderilir.
// Bu sayede token, istemci tarafı JavaScript ile okunamaz (XSS'e karşı koruma).

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * adminGirisController - Admin giriş endpoint handler'ı.
 * POST /api/admin/giris
 * Body: { sifre: "admin parolası" }
 * Başarılı: JWT httpOnly cookie olarak set edilir, basari: true döner
 * Başarısız: 401 Unauthorized
 */
async function adminGirisController(req, res) {
    try {
        const { sifre } = req.body;

        // GÜVENLİK: Tip kontrolü — NoSQL injection için obje gelirse reddet
        if (!sifre || typeof sifre !== 'string') {
            return res.status(400).json({ basari: false, mesaj: 'Geçersiz istek.' });
        }

        const adminHash = process.env.ADMIN_PASS_HASH;

        if (!adminHash) {
            console.error('🔴 KRİTİK: ADMIN_PASS_HASH .env dosyasında tanımlı değil!');
            return res.status(500).json({ basari: false, mesaj: 'Sunucu yapılandırma hatası.' });
        }

        // bcrypt ile hash karşılaştırma (timing-safe)
        const uyusuyorMu = await bcrypt.compare(sifre, adminHash);

        if (!uyusuyorMu) {
            // GÜVENLİK: Hatalı giriş denemelerini logla (Brute-force tespiti için)
            console.warn('⚠️ Başarısız admin giriş denemesi | IP:', req.ip);
            return res.status(401).json({ basari: false, mesaj: 'Hatalı şifre!' });
        }

        // GÜVENLİK: JWT oluştururken algoritmayı açıkça belirt (alg:none saldırısını önle)
        const token = jwt.sign(
            { rol: 'admin', iat: Math.floor(Date.now() / 1000) },
            process.env.JWT_SECRET,
            { 
                algorithm: 'HS256',
                expiresIn: '4h' // Token 4 saat geçerli
            }
        );

        // GÜVENLİK: Token'ı httpOnly cookie olarak ayarla
        // - httpOnly: JavaScript ile erişilemez (XSS koruması)
        // - secure: Sadece HTTPS üzerinden gönderilir (production'da)
        // - sameSite: CSRF saldırılarına karşı koruma
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 4 * 60 * 60 * 1000, // 4 saat (ms cinsinden)
            path: '/'
        });

        return res.json({ basari: true, mesaj: 'Giriş başarılı.' });

    } catch (err) {
        console.error('🔴 Admin Giriş Hatası:', err);
        return res.status(500).json({ basari: false, mesaj: 'Sunucu hatası.' });
    }
}

/**
 * adminCikisController - Admin çıkış endpoint handler'ı.
 * POST /api/admin/cikis
 * httpOnly cookie'yi temizler.
 */
function adminCikisController(req, res) {
    res.clearCookie('admin_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/'
    });
    return res.json({ basari: true, mesaj: 'Çıkış yapıldı.' });
}

module.exports = { adminGirisController, adminCikisController };
