// ==========================================
// GÜVENLİ PAROLA SIFIRLAMA TOKEN ÜRETİCİ
// ==========================================
// Güvenlik: Varsayılan "123456" parola atama mantığı yerine,
// crypto.randomBytes ile benzersiz, 1 saat geçerli sıfırlama token'ı üretir.
// Token'ın hash'i veritabanına kaydedilir (açık metin DB'ye YAZILMAZ).

const crypto = require('crypto');

/**
 * sifreSifirlamaTokeniUret - Güvenli sıfırlama token'ı üretir.
 * 
 * @returns {Object} { token, tokenHash, expires }
 *   - token: Kullanıcıya/admin'e gösterilecek açık metin token (32 byte hex)
 *   - tokenHash: Veritabanına kaydedilecek SHA-256 hash
 *   - expires: Token'ın son kullanma tarihi (1 saat sonra)
 * 
 * Neden hash'liyoruz?
 * Eğer veritabanı sızarsa (data breach), saldırgan açık token'larla
 * şifre sıfırlama yapamaz. Sadece hash tutarak "defense in depth" prensibi uygulanır.
 */
function sifreSifirlamaTokeniUret() {
    // GÜVENLİK: 32 byte (256-bit) kriptografik rastgele değer
    const token = crypto.randomBytes(32).toString('hex');

    // GÜVENLİK: Token'ı SHA-256 ile hash'le — DB'ye bu kaydedilecek
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // 1 saat geçerlilik süresi
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    return { token, tokenHash, expires };
}

/**
 * tokenHashDogrula - Gelen token'ı hash'leyip DB'deki hash ile karşılaştırır.
 * 
 * @param {string} gelenToken - Kullanıcının gönderdiği açık metin token
 * @param {string} kayitliHash - Veritabanındaki SHA-256 hash
 * @returns {boolean} Eşleşiyor mu
 */
function tokenHashDogrula(gelenToken, kayitliHash) {
    const gelenHash = crypto.createHash('sha256').update(gelenToken).digest('hex');

    // GÜVENLİK: Timing-safe karşılaştırma (timing attack önlemi)
    try {
        return crypto.timingSafeEqual(
            Buffer.from(gelenHash, 'hex'),
            Buffer.from(kayitliHash, 'hex')
        );
    } catch (e) {
        return false;
    }
}

module.exports = { sifreSifirlamaTokeniUret, tokenHashDogrula };
