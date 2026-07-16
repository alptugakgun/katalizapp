// ==========================================
// GİRDİ DOĞRULAMA (INPUT VALIDATION) MIDDLEWARE
// ==========================================
// Güvenlik: NoSQL Injection'a karşı req.body alanlarını şema tabanlı doğrular.
// Sadece beklenen tipler (string, number) kabul edilir; MongoDB operatör objeleri ($ne, $gt vb.) bloklanır.

/**
 * girdiDogrula - Şema tabanlı istek doğrulama middleware'i.
 * 
 * @param {Object} sema - Beklenen alanlar ve kuralları.
 *   Her alan: { zorunlu: Boolean, tip: 'string'|'number', minUzunluk, maxUzunluk, regex }
 * 
 * Kullanım:
 *   app.post('/api/veli/giris', girdiDogrula({ veliKodu: { zorunlu: true, tip: 'string', regex: /^V-\d{4}$/ } }), handler);
 */
function girdiDogrula(sema) {
    return (req, res, next) => {
        const hatalar = [];

        for (const [alan, kurallar] of Object.entries(sema)) {
            const deger = req.body[alan];

            // Zorunluluk kontrolü
            if (kurallar.zorunlu && (deger === undefined || deger === null || deger === '')) {
                hatalar.push(`'${alan}' alanı zorunludur.`);
                continue;
            }

            // Alan gönderilmediyse ve zorunlu değilse atla
            if (deger === undefined || deger === null) continue;

            // Tip kontrolü — NoSQL Injection'ın çekirdeği burada bloklanır.
            // MongoDB operatörleri ($ne, $gt vb.) obje olarak gelir; biz sadece primitive tiplere izin veriyoruz.
            if (kurallar.tip === 'string') {
                if (typeof deger !== 'string') {
                    // GÜVENLİK: Obje olarak gelen değer NoSQL Injection girişimi olabilir
                    hatalar.push(`'${alan}' alanı metin (string) olmalıdır. Obje kabul edilmez.`);
                    continue;
                }
            } else if (kurallar.tip === 'number') {
                if (typeof deger !== 'number' || isNaN(deger)) {
                    hatalar.push(`'${alan}' alanı sayısal (number) olmalıdır.`);
                    continue;
                }
            }

            // Minimum uzunluk
            if (kurallar.minUzunluk && typeof deger === 'string' && deger.length < kurallar.minUzunluk) {
                hatalar.push(`'${alan}' alanı en az ${kurallar.minUzunluk} karakter olmalıdır.`);
            }

            // Maksimum uzunluk
            if (kurallar.maxUzunluk && typeof deger === 'string' && deger.length > kurallar.maxUzunluk) {
                hatalar.push(`'${alan}' alanı en fazla ${kurallar.maxUzunluk} karakter olmalıdır.`);
            }

            // Regex pattern kontrolü
            if (kurallar.regex && typeof deger === 'string' && !kurallar.regex.test(deger)) {
                hatalar.push(`'${alan}' alanı beklenen formata uymuyor.`);
            }
        }

        if (hatalar.length > 0) {
            // GÜVENLİK: Hata detaylarını loglayıp, istemciye generic mesaj dön
            console.warn('⚠️ Girdi Doğrulama Hatası:', hatalar, '| IP:', req.ip);
            return res.status(400).json({ 
                basari: false, 
                mesaj: 'Geçersiz giriş verisi. Lütfen alanları kontrol edin.' 
            });
        }

        next();
    };
}

module.exports = { girdiDogrula };
