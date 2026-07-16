// ==========================================
// ROL TABANLI YETKİLENDİRME MIDDLEWARE
// ==========================================
// Güvenlik: Gelen istekteki httpOnly cookie'den JWT'yi alır, doğrular ve
// kullanıcının "admin" rolüne sahip olup olmadığını kontrol eder.
// Bu middleware tüm /api/admin/* route'larına eklenerek yetkisiz erişimi engeller.

const jwt = require('jsonwebtoken');

/**
 * adminKorumasi - JWT tabanlı admin yetkilendirme middleware'i.
 * 
 * Kontroller:
 * 1. Cookie'de 'admin_token' var mı?
 * 2. Token geçerli mi? (imza + süre)
 * 3. Algoritmayı açıkça HS256 olarak zorunlu kılar (alg:none saldırısı önlenir)
 * 4. Payload'daki rol "admin" mi?
 */
function adminKorumasi(req, res, next) {
    try {
        const token = req.cookies && req.cookies.admin_token;

        if (!token) {
            // GÜVENLİK: Token yoksa erişimi reddet (fail closed prensibi)
            return res.status(401).json({ 
                basari: false, 
                mesaj: 'Yetkilendirme başarısız. Lütfen giriş yapın.' 
            });
        }

        // GÜVENLİK: algorithms dizisine yalnızca HS256 veriyoruz.
        // Bu, saldırganın token header'ında "alg":"none" veya "alg":"HS512" 
        // gibi farklı algoritmalar kullanmasını engeller.
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256']
        });

        // Rol kontrolü — sadece "admin" rolüne sahip token'lar geçebilir
        if (decoded.rol !== 'admin') {
            console.warn('⚠️ Yetkisiz erişim denemesi | Rol:', decoded.rol, '| IP:', req.ip);
            return res.status(403).json({ 
                basari: false, 
                mesaj: 'Bu işlem için yetkiniz bulunmuyor.' 
            });
        }

        // Token geçerli ve rol admin — devam et
        req.adminUser = decoded;
        next();

    } catch (err) {
        // GÜVENLİK: Token süresi dolmuş, geçersiz imza veya bozuk token
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                basari: false, 
                mesaj: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.' 
            });
        }

        console.warn('⚠️ Geçersiz JWT denemesi | Hata:', err.message, '| IP:', req.ip);
        return res.status(401).json({ 
            basari: false, 
            mesaj: 'Geçersiz yetkilendirme. Lütfen tekrar giriş yapın.' 
        });
    }
}

module.exports = { adminKorumasi };
