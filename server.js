require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Güvenlik ayarı: API Anahtarın artık .env dosyasından güvenli bir şekilde çekiliyor
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 🛡️ GÜVENLİK KALKANARI (v3.0)
const mongoSanitizeSafe = require('./middleware/mongoSanitizeSafe');
const cookieParser = require('cookie-parser');
const { girdiDogrula } = require('./middleware/sanitize');
const { adminGirisController, adminCikisController } = require('./middleware/auth');
const { adminKorumasi } = require('./middleware/adminAuth');
const { sifreSifirlamaTokeniUret, tokenHashDogrula } = require('./middleware/resetToken');
const { sifirlamaMailiGonder } = require('./utils/mailer');

const app = express();

// Googlebot ve diğer arama motorları için özel robots.txt rotası.
// Güvenlik filtrelerine (Helmet) takılmaması ve tamamen saf bir dosya dönmesi için en üste koyuyoruz.
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send("User-agent: *\nAllow: /\n\nSitemap: https://egitim-kocu-projesi2.onrender.com/sitemap.xml");
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://cdn-icons-png.flaticon.com", "https://*"],
            mediaSrc: ["'self'", "https://assets.mixkit.co"],
            connectSrc: ["'self'", "wss:", "ws:"]
        }
    }
}));

// DDoS ve Brute-Force koruması: 15 dakikada 100 API isteği limiti
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { basari: false, mesaj: "Çok fazla istek attınız, lütfen biraz bekleyin." }
});
app.use('/api/', apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser()); // 🛡️ Cookie tabanlı JWT auth için gerekli
app.use(mongoSanitizeSafe()); // 🛡️ NoSQL Injection koruması: $ne, $gt gibi operatörleri req.body/query/params'dan güvenli bir şekilde temizler
app.use(express.static('public'));

// 🛡️ Brute-Force Koruması: Giriş endpoint'leri için özel sıkı rate limiter
const girisLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika pencere
    max: 5, // Maksimum 5 deneme
    message: { basari: false, mesaj: 'Çok fazla başarısız giriş denemesi. 15 dakika sonra tekrar deneyiniz.' },
    standardHeaders: true,
    legacyHeaders: false,
    // GÜVENLİK: Sadece başarısız istekleri say (başarılı olanlar limiti etkilemesin)
    skipSuccessfulRequests: true
});

// ==========================================
// SAYFA YÖNLENDİRMELERİ (CLEAN URL)
// ==========================================
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/login', (req, res) => res.sendFile(__dirname + '/public/login.html'));
app.get('/kayit', (req, res) => res.sendFile(__dirname + '/public/kayit.html'));
app.get('/ogretmen-login', (req, res) => res.sendFile(__dirname + '/public/ogretmen-login.html'));
app.get('/ogretmen-kayit', (req, res) => res.sendFile(__dirname + '/public/ogretmen-kayit.html'));
app.get('/veli-login', (req, res) => res.sendFile(__dirname + '/public/veli-login.html'));
app.get('/ogrenci', (req, res) => res.sendFile(__dirname + '/public/ogrenci.html'));
app.get('/ogretmen', (req, res) => res.sendFile(__dirname + '/public/ogretmen.html'));
app.get('/veli', (req, res) => res.sendFile(__dirname + '/public/veli.html'));
app.get('/admin', (req, res) => res.sendFile(__dirname + '/public/admin.html'));

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    maxHttpBufferSize: 1e8
});

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
    .then(() => {
        console.log('🫀 MongoDB Bağlantısı Başarılı! (Zırhlı Altyapı)');
    })
    .catch((err) => {
        console.log('❌ Veritabanı Hatası:', err);
    });

// ==========================================
// 1. VERİTABANI ŞEMALARI
// ==========================================

const ogretmenSchema = new mongoose.Schema({
    kocAd: String,
    sifre: String,
    kocKodu: String,
    finans: { type: Object, default: {} },
    // 🛡️ Güvenli parola sıfırlama token alanları
    sifreSifirlamaToken: { type: String, default: null },
    sifreSifirlamaExpires: { type: Date, default: null }
});
const Ogretmen = mongoose.model('Ogretmen', ogretmenSchema);

const ogrenciSchema = new mongoose.Schema({
    ogrenciAd: String,
    sifre: String,
    kocKodu: String,
    veliKodu: String,
    ders: { type: String, default: 'Bekliyor...' },
    mesaj: { type: String, default: '' },
    xp: { type: Number, default: 0 },
    avatar: { type: String, default: '👤' },
    gorevler: { type: Array, default: [] },
    calismaProgrami: { type: Array, default: [] },
    istatistik: { type: Object, default: {} },
    netler: { type: Array, default: [] },
    alinanOduller: { type: Array, default: [] },
    bekleyenOduller: { type: Array, default: [] },
    aktifDuello: { type: Object, default: null },
    finans: { type: Object, default: {} },
    sonrakiDers: { type: String, default: '' },
    gorusmeKonusu: { type: String, default: '' },
    canliDersLink: { type: String, default: '' },
    isiHaritasi: { type: Object, default: {} },
    hataDefteri: { type: Array, default: [] },
    rehberlikTestleri: { type: Array, default: [] },
    tamamlananKaynaklar: { type: Array, default: [] },
    aktiviteGecmisi: { type: Array, default: [] },
    // 🛡️ Güvenli parola sıfırlama token alanları
    sifreSifirlamaToken: { type: String, default: null },
    sifreSifirlamaExpires: { type: Date, default: null }
});
const Ogrenci = mongoose.model('Ogrenci', ogrenciSchema);

const chatSchema = new mongoose.Schema({
    id: Number,
    gonderen: String,
    mesaj: String,
    rol: String,
    saat: String,
    tip: { type: String, default: 'metin' },
    kocKodu: String
});
const Chat = mongoose.model('Chat', chatSchema);

const kaynakSchema = new mongoose.Schema({
    id: Number,
    kocKodu: String,
    baslik: String,
    url: String,
    tarih: String
});
const Kaynak = mongoose.model('Kaynak', kaynakSchema);

// ==========================================
// 2. HTTP API İŞLEMLERİ (GÜVENLİ v3.0)
// ==========================================

// 🛡️ ADMIN GİRİŞ — JWT + httpOnly Cookie (Brute-force korumalı)
app.post('/api/admin/giris', girisLimiter, adminGirisController);

// 🛡️ ADMIN ÇIKIŞ — Cookie temizleme
app.post('/api/admin/cikis', adminCikisController);

// 🛡️ ADMIN VERİ ÇEK — JWT middleware ile korunuyor (body'de şifre YOK)
app.post('/api/admin', adminKorumasi, async (req, res) => {
    try {
        let koclar = await Ogretmen.find();
        let ogrler = await Ogrenci.find();
        res.json({ basari: true, data: { koclar, ogrler } });
    } catch (e) {
        console.error("🔴 Admin Veri Hatası:", e);
        res.status(500).json({ basari: false });
    }
});

// 🛡️ ADMIN FİNANS KAYDET — JWT middleware ile korunuyor
app.post('/api/admin/finans_kaydet', adminKorumasi, async (req, res) => {
    try {
        const { kocKodu, finans } = req.body;
        await Ogretmen.updateOne({ kocKodu: kocKodu }, { finans: finans });
        res.json({ basari: true });
    } catch (e) {
        console.error("🔴 Finans Kayıt Hatası:", e);
        res.status(500).json({ basari: false });
    }
});

// 🛡️ ADMIN KOÇ SİL — JWT middleware ile korunuyor
app.post('/api/admin/sil', adminKorumasi, async (req, res) => {
    try {
        const { kod } = req.body;
        await Ogretmen.deleteOne({ kocKodu: kod });
        await Ogrenci.deleteMany({ kocKodu: kod });
        await Chat.deleteMany({ kocKodu: kod });
        await Kaynak.deleteMany({ kocKodu: kod });
        res.json({ basari: true });
    } catch (e) {
        console.error("🔴 Koç Silme Hatası:", e);
        res.status(500).json({ basari: false });
    }
});

// 🛡️ ADMIN ÖĞRENCİ SİL — JWT middleware ile korunuyor
app.post('/api/admin/sil_ogrenci', adminKorumasi, async (req, res) => {
    try {
        const { ogrenciId } = req.body;
        await Ogrenci.findByIdAndDelete(ogrenciId);
        res.json({ basari: true });
    } catch (e) {
        console.error("🔴 Öğrenci Silme Hatası:", e);
        res.status(500).json({ basari: false });
    }
});

// 🛡️ ADMIN ÖĞRENCİ ŞİFRE SIFIRLAMA — Token tabanlı (varsayılan "123456" KALDIRILDI)
app.post('/api/admin/sifre_sifirla_ogrenci', adminKorumasi, async (req, res) => {
    try {
        const { ogrenciId } = req.body;

        // GÜVENLİK: Güvenli token üret (açık metin DB'ye yazılmaz, hash kaydedilir)
        const { token, tokenHash, expires } = sifreSifirlamaTokeniUret();

        const ogrenci = await Ogrenci.findByIdAndUpdate(ogrenciId, {
            sifreSifirlamaToken: tokenHash,
            sifreSifirlamaExpires: expires
        }, { new: true });

        // E-posta gönderim mantığı entegrasyonu
        // Şemada 'email' alanı olmadığından simüle ediliyor. İleride ogrenci.eposta şeklinde değiştirilebilir.
        await sifirlamaMailiGonder('ogrenci_maili@ornek.com', ogrenci.ogrenciAd, token);

        // Token admin ekranında gösterilir, admin kullanıcıya iletir
        res.json({ basari: true, token: token, mesaj: 'Sıfırlama token\'ı e-posta olarak gönderildi (Log).' });
    } catch (e) {
        console.error("🔴 Öğrenci Şifre Sıfırlama Hatası:", e);
        res.status(500).json({ basari: false });
    }
});

// 🛡️ ADMIN KOÇ ŞİFRE SIFIRLAMA — Token tabanlı (varsayılan "123456" KALDIRILDI)
app.post('/api/admin/sifre_sifirla_koc', adminKorumasi, async (req, res) => {
    try {
        const { kocKodu } = req.body;

        const { token, tokenHash, expires } = sifreSifirlamaTokeniUret();

        const koc = await Ogretmen.findOneAndUpdate({ kocKodu: kocKodu }, {
            sifreSifirlamaToken: tokenHash,
            sifreSifirlamaExpires: expires
        }, { new: true });

        // E-posta gönderim mantığı entegrasyonu
        await sifirlamaMailiGonder('koc_maili@ornek.com', koc.kocAd, token);

        res.json({ basari: true, token: token, mesaj: 'Sıfırlama token\'ı e-posta olarak gönderildi (Log).' });
    } catch (e) {
        console.error("🔴 Koç Şifre Sıfırlama Hatası:", e);
        res.status(500).json({ basari: false });
    }
});

// 🛡️ TOKEN İLE ŞİFRE GÜNCELLEME — Öğrenci veya koç
app.post('/api/sifre-sifirla', girisLimiter, async (req, res) => {
    try {
        const { token, yeniSifre, tip } = req.body;

        // GÜVENLİK: Tip kontrolü
        if (!token || typeof token !== 'string' || !yeniSifre || typeof yeniSifre !== 'string') {
            return res.status(400).json({ basari: false, mesaj: 'Geçersiz istek.' });
        }

        if (yeniSifre.length < 6) {
            return res.status(400).json({ basari: false, mesaj: 'Şifre en az 6 karakter olmalıdır.' });
        }

        // Token'ı hash'le ve DB'de ara
        const crypto = require('crypto');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const Model = tip === 'koc' ? Ogretmen : Ogrenci;
        const kullanici = await Model.findOne({
            sifreSifirlamaToken: tokenHash,
            sifreSifirlamaExpires: { $gt: new Date() } // Süresi dolmamış mı?
        });

        if (!kullanici) {
            return res.status(400).json({ basari: false, mesaj: 'Geçersiz veya süresi dolmuş token.' });
        }

        // Yeni şifreyi hash'le ve kaydet
        const tuz = await bcrypt.genSalt(12);
        const hashliSifre = await bcrypt.hash(yeniSifre, tuz);

        kullanici.sifre = hashliSifre;
        kullanici.sifreSifirlamaToken = null;   // Token'ı tek kullanımlık yap
        kullanici.sifreSifirlamaExpires = null;
        await kullanici.save();

        res.json({ basari: true, mesaj: 'Şifreniz başarıyla güncellendi.' });
    } catch (e) {
        console.error("🔴 Şifre Güncelleme Hatası:", e);
        res.status(500).json({ basari: false, mesaj: 'Sunucu hatası.' });
    }
});

// 🛡️ KOÇ KAYIT — Brute-force korumalı
app.post('/api/koc/kayit', girisLimiter, async (req, res) => {
    try {
        const { kocAd, sifre } = req.body;
        let varMi = await Ogretmen.findOne({ kocAd });

        if (varMi) {
            return res.json({ basari: false, mesaj: "Bu eğitmen ismi zaten alınmış!" });
        }

        const tuz = await bcrypt.genSalt(12);
        const hashliSifre = await bcrypt.hash(sifre, tuz);

        let yeniKod = Math.random().toString(36).substr(2, 6).toUpperCase();
        let yeniKoc = new Ogretmen({ kocAd, sifre: hashliSifre, kocKodu: yeniKod, finans: {} });

        await yeniKoc.save();
        res.json({ basari: true, mesaj: `Kaydınız yapıldı. Davet Kodunuz: ${yeniKod}`, kocKodu: yeniKod });
    } catch (e) { console.error("🔴 Sistem Hatası (API):", e); res.json({ basari: false }); }
});

// 🛡️ KOÇ GİRİŞ — Brute-force korumalı + Girdi Doğrulama
app.post('/api/koc/giris',
    girisLimiter,
    girdiDogrula({
        kocAd: { zorunlu: true, tip: 'string', minUzunluk: 3 },
        sifre: { zorunlu: true, tip: 'string', minUzunluk: 6 }
    }),
    async (req, res) => {
        try {
            const { kocAd, sifre } = req.body;
            let koc = await Ogretmen.findOne({ kocAd });

            if (koc) {
                const uyusuyorMu = await bcrypt.compare(sifre, koc.sifre);
                if (uyusuyorMu) {
                    return res.json({ basari: true, kocKodu: koc.kocKodu });
                }
            }
            res.json({ basari: false, mesaj: "Hatalı isim veya şifre!" });
        } catch (e) { console.error("🔴 Sistem Hatası (API):", e); res.json({ basari: false }); }
    });

// 🛡️ ÖĞRENCİ KAYIT
app.post('/api/kayit', girisLimiter, async (req, res) => {
    try {
        const { ogrenciAd, sifre, kocKodu } = req.body;
        let kocVarMi = await Ogretmen.findOne({ kocKodu });

        if (!kocVarMi) {
            return res.json({ basari: false, mesaj: "Davet Kodu geçersiz!" });
        }

        let varMi = await Ogrenci.findOne({ ogrenciAd, kocKodu });

        if (varMi) {
            return res.json({ basari: false, mesaj: "Bu öğrenci adı zaten kullanılıyor!" });
        }

        const tuz = await bcrypt.genSalt(12);
        const hashliSifre = await bcrypt.hash(sifre, tuz);

        let vKodu = 'V-' + Math.floor(1000 + Math.random() * 9000);
        let yeniOgrenci = new Ogrenci({
            ogrenciAd,
            sifre: hashliSifre,
            kocKodu,
            veliKodu: vKodu,
            xp: 0,
            avatar: '👤',
            finans: {},
            hataDefteri: [],
            rehberlikTestleri: [],
            tamamlananKaynaklar: [],
            aktiviteGecmisi: [],
            calismaProgrami: []
        });

        await yeniOgrenci.save();
        res.json({ basari: true, mesaj: "KatalizApp'e hoş geldin!" });
    } catch (e) { console.error("🔴 Sistem Hatası (API):", e); res.json({ basari: false }); }
});

// 🛡️ ÖĞRENCİ GİRİŞ — Brute-force korumalı + Girdi Doğrulama
app.post('/api/giris',
    girisLimiter,
    girdiDogrula({
        ogrenciAd: { zorunlu: true, tip: 'string', minUzunluk: 2 },
        sifre: { zorunlu: true, tip: 'string', minUzunluk: 6 }
    }),
    async (req, res) => {
        try {
            const { ogrenciAd, sifre } = req.body;
            let ogrenci = await Ogrenci.findOne({ ogrenciAd });

            if (ogrenci) {
                const uyusuyorMu = await bcrypt.compare(sifre, ogrenci.sifre);
                if (uyusuyorMu) {
                    return res.json({ basari: true, kocKodu: ogrenci.kocKodu, veliKodu: ogrenci.veliKodu });
                }
            }
            res.json({ basari: false, mesaj: "Kullanıcı adı veya şifre hatalı!" });
        } catch (e) { console.error("🔴 Sistem Hatası (API):", e); res.json({ basari: false }); }
    });

// 🛡️ VELİ GİRİŞ — Brute-force korumalı + Girdi Doğrulama (NoSQL Injection önlemi)
app.post('/api/veli/giris',
    girisLimiter,
    girdiDogrula({
        veliKodu: { zorunlu: true, tip: 'string', regex: /^V-\d{4}$/, maxUzunluk: 6 }
    }),
    async (req, res) => {
        try {
            let ogrenci = await Ogrenci.findOne({ veliKodu: req.body.veliKodu });

            if (ogrenci) {
                res.json({ basari: true, ogrenciAd: ogrenci.ogrenciAd, kocKodu: ogrenci.kocKodu });
            } else {
                res.json({ basari: false, mesaj: "Veli Takip Kodu bulunamadı!" });
            }
        } catch (e) { console.error("🔴 Sistem Hatası (API):", e); res.json({ basari: false }); }
    }
);

app.post('/api/sifreler', async (req, res) => {
    try {
        let ogrenciler = await Ogrenci.find({ kocKodu: req.body.kocKodu }, 'ogrenciAd veliKodu -_id');
        res.json(ogrenciler);
    } catch (e) {
        res.json([]);
    }
});

// ==========================================
// 3. SUNUCU HAFIZASI (ROOM DATA)
// ==========================================
// Sınıflara (Koç Kodlarına) özel Ejderha Canı ve Tahta Çizim Hafızası
const roomData = {};

function getRoomData(kocKodu) {
    if (!roomData[kocKodu]) {
        roomData[kocKodu] = {
            bossHp: 10000,
            tahtaGecmisi: [],
            tahtaAcik: false
        };
    }
    return roomData[kocKodu];
}


// ==========================================
// 4. SOCKET.IO (CANLI VERİ AKIŞI)
// ==========================================

io.on('connection', (socket) => {

    socket.on('join_room', async (kocKodu) => {
        socket.join(kocKodu);
        try {
            const ogrenciler = await Ogrenci.find({ kocKodu });
            const ogretmen = await Ogretmen.findOne({ kocKodu });

            const aylar = ["Oca", "Sub", "Mar", "Nis", "May", "Haz", "Tem", "Agu", "Eyl", "Eki", "Kas", "Ara"];
            const suAnkiAy = aylar[new Date().getMonth()];

            if (ogretmen && (!ogretmen.finans || !ogretmen.finans[suAnkiAy])) {
                socket.emit('finans_uyarisi', {
                    tip: 'lisans',
                    mesaj: `${suAnkiAy} ayı platform kullanım ödemeniz henüz kaydedilmemiştir.`
                });
            }

            ogrenciler.forEach(ogr => {
                if (!ogr.finans || !ogr.finans[suAnkiAy]) {
                    socket.emit('finans_uyarisi', {
                        tip: 'ogrenci',
                        ogrenci: ogr.ogrenciAd,
                        mesaj: `${ogr.ogrenciAd} için ${suAnkiAy} ayı ödemesi henüz sisteme işlenmedi.`
                    });
                }
            });

            socket.emit('eski_verileri_yukle', ogrenciler);
            socket.emit('gorev_guncellendi', ogrenciler);

            const eskiChat = await Chat.find({ kocKodu }).sort({ _id: -1 }).limit(50);
            socket.emit('eski_chat_yukle', eskiChat.reverse());

            const eskiKaynaklar = await Kaynak.find({ kocKodu }).sort({ id: -1 });
            socket.emit('kaynaklari_yukle', eskiKaynaklar);

            // 🔥 Yeni: Odaya katılana güncel Boss Canını ve Tahta durumunu gönder
            let rData = getRoomData(kocKodu);
            socket.emit('boss_guncellendi', { hp: rData.bossHp, sonVuran: "" });

            if (rData.tahtaAcik) {
                socket.emit('canli_tahta_durumu', { kocKodu: kocKodu, acik: true });
                // Geç kalan öğrenciye geçmiş çizimleri döküyoruz
                rData.tahtaGecmisi.forEach(cizim => {
                    socket.emit('canli_cizim_geldi', cizim);
                });
            }

        } catch (hata) {
            console.error("Join Room Hatası:", hata);
        }
    });

    // 🐉 YENİ: EJDERHA HASAR SİNYALİ
    socket.on('boss_hasar_ver', (veri) => {
        let rData = getRoomData(veri.kocKodu);
        if (rData.bossHp > 0) {
            rData.bossHp -= veri.hasar;
            if (rData.bossHp < 0) rData.bossHp = 0;

            // Tüm sınıfa ejderhanın yeni canını fırlat
            io.to(veri.kocKodu).emit('boss_guncellendi', { hp: rData.bossHp, sonVuran: veri.ogrenciAd });
        }
    });

    // 🎨 YENİ: AKILLI TAHTA HAFIZASI
    socket.on('tahta_aktiflesiyor', (veri) => {
        let rData = getRoomData(veri.kocKodu);
        rData.tahtaAcik = veri.acik;
        if (!veri.acik) rData.tahtaGecmisi = []; // Tahta kapanırsa hafızayı temizle
        socket.to(veri.kocKodu).emit('canli_tahta_durumu', veri);
    });

    socket.on('tahta_cizim_yap', (veri) => {
        let rData = getRoomData(veri.kocKodu);
        if (veri.temizle) {
            rData.tahtaGecmisi = [];
        } else {
            rData.tahtaGecmisi.push(veri);
            // RAM şişmesin diye max 2000 çizgi tutuyoruz
            if (rData.tahtaGecmisi.length > 2000) rData.tahtaGecmisi.shift();
        }
        socket.to(veri.kocKodu).emit('canli_cizim_geldi', veri);
    });

    socket.on('ajanda_kaydet', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                ogrenci.sonrakiDers = veri.sonrakiDers;
                ogrenci.gorusmeKonusu = veri.gorusmeKonusu;
                ogrenci.canliDersLink = veri.canliDersLink;
                ogrenci.finans = veri.finans;
                ogrenci.markModified('finans');

                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('masa_basi_uyarisi', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                ogrenci.ders = "MASA BAŞINDAN AYRILDI";
                ogrenci.mesaj = "Sistem tarafından otomatik durduruldu.";
                await ogrenci.save();

                io.to(veri.kocKodu).emit('ogretmene_canli_bildirim', ogrenci);
                io.to(veri.kocKodu).emit('afk_kacak_ogrenci', {
                    ogrenciAd: veri.ogrenciAd,
                    mesaj: "🚨 DİKKAT! Öğrenci yoklamaya cevap vermedi, masada değil!"
                });
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('net_ekle', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });

            if (ogrenci) {
                ogrenci.netler.push({
                    id: Date.now(),
                    tur: veri.sinavTuru,
                    net: veri.netSkoru,
                    detay: veri.detay || null,
                    tarih: new Date().toLocaleDateString('tr-TR')
                });
                ogrenci.markModified('netler');

                if (veri.detay) {
                    let harita = ogrenci.isiHaritasi || {};
                    for (const [dersAdi, netSayisi] of Object.entries(veri.detay)) {
                        if (netSayisi < 10) {
                            harita[dersAdi + " (Genel)"] = "🟥 Zayıf (Oto-Analiz)";
                        } else if (netSayisi > 25) {
                            harita[dersAdi + " (Genel)"] = "🟩 İyi (Oto-Analiz)";
                        }
                    }
                    ogrenci.isiHaritasi = harita;
                    ogrenci.markModified('isiHaritasi');
                }

                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('rehberlik_testi_kaydet', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                ogrenci.rehberlikTestleri.push({
                    testAdi: veri.testAdi,
                    skor: veri.skor,
                    sonuc: veri.sonuc,
                    tarih: new Date().toLocaleDateString('tr-TR')
                });
                ogrenci.markModified('rehberlikTestleri');
                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('odul_satin_al', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci && ogrenci.xp >= veri.bedel) {
                ogrenci.xp -= veri.bedel;
                let odulData = { id: Date.now(), odul: veri.odul, tarih: new Date().toLocaleDateString('tr-TR') };
                ogrenci.alinanOduller.push(odulData);
                ogrenci.bekleyenOduller.push(odulData);
                ogrenci.markModified('alinanOduller');
                ogrenci.markModified('bekleyenOduller');
                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
                io.to(veri.kocKodu).emit('ogretmene_market_bildirimi', { ogrenci: veri.ogrenciAd, odul: veri.odul });
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('odul_teslim_edildi', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                ogrenci.bekleyenOduller = ogrenci.bekleyenOduller.filter(o => o.id !== veri.odulId);
                ogrenci.markModified('bekleyenOduller');
                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('hata_sorusu_ekle', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                let yeniSoru = { id: Date.now(), resim: veri.resim, dersKonu: veri.dersKonu, durum: 'Bekliyor', tarih: new Date().toLocaleDateString('tr-TR') };
                ogrenci.hataDefteri.push(yeniSoru);

                // 🗄️ VERİTABANI DİYETİ: Max 40 soru tut
                if (ogrenci.hataDefteri.length > 40) {
                    ogrenci.hataDefteri.shift();
                }

                ogrenci.markModified('hataDefteri');
                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
                io.to(veri.kocKodu).emit('ogretmene_market_bildirimi', { ogrenci: veri.ogrenciAd, odul: "Hata Defterine Soru Yükledi" });
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('hata_sorusu_cozuldu', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci && ogrenci.hataDefteri) {
                let idx = ogrenci.hataDefteri.findIndex(h => h.id === veri.soruId);
                if (idx !== -1) {
                    ogrenci.hataDefteri[idx].durum = 'Çözüldü';
                    ogrenci.hataDefteri[idx].tarih = new Date().toLocaleDateString('tr-TR');

                    ogrenci.markModified('hataDefteri');
                    await ogrenci.save();

                    let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                    io.to(veri.kocKodu).emit('gorev_guncellendi', list);
                }
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('isi_haritasi_guncelle', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                let harita = ogrenci.isiHaritasi || {};
                harita[veri.konu] = veri.durum;
                ogrenci.isiHaritasi = harita;
                ogrenci.markModified('isiHaritasi');
                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('aktivite_kaydet', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                if (!ogrenci.aktiviteGecmisi) ogrenci.aktiviteGecmisi = [];

                if (veri.sure >= 60000) {
                    ogrenci.aktiviteGecmisi.unshift({
                        id: Date.now(),
                        tarih: new Date().toLocaleDateString('tr-TR'),
                        saat: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                        ders: veri.ders,
                        sureMs: veri.sure,
                        tip: veri.tip || 'Çalışma'
                    });

                    if (ogrenci.aktiviteGecmisi.length > 50) {
                        ogrenci.aktiviteGecmisi.pop();
                    }

                    ogrenci.markModified('aktiviteGecmisi');
                    await ogrenci.save();

                    let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                    io.to(veri.kocKodu).emit('gorev_guncellendi', list);
                }
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    // MEVCUT "yeni_gorev_ekle" FONKSİYONUNU BUL VE BUNUNLA DEĞİŞTİR:
    socket.on('yeni_gorev_ekle', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                let metin = veri.gorevMetni;
                let isZincir = metin.includes('>');
                let altAdimlar = [];

                // Eğer içinde ">" varsa, bu bir zincir görevdir. Parçalara ayır!
                if (isZincir) {
                    altAdimlar = metin.split('>').map(m => ({ metin: m.trim(), tamamlandi: false }));
                }

                ogrenci.gorevler.push({
                    id: Date.now(),
                    metin: isZincir ? altAdimlar[0].metin : metin, // Zincirse ilk adımı ana başlık yap
                    orijinalMetin: metin,
                    tamamlandi: false,
                    isZincir: isZincir,
                    altAdimlar: altAdimlar
                });

                // 🗄️ VERİTABANI DİYETİ: Max 50 Görev
                if (ogrenci.gorevler.length > 50) {
                    ogrenci.gorevler.shift();
                }

                ogrenci.markModified('gorevler');
                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    // HEMEN ALTINA BU YENİ ZİNCİR KIRICI FONKSİYONU EKLE:
    socket.on('zincir_adim_tamamla', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci && ogrenci.gorevler) {
                let gIndex = ogrenci.gorevler.findIndex(g => Number(g.id) === Number(veri.gorevId));
                if (gIndex !== -1 && ogrenci.gorevler[gIndex].isZincir) {

                    // Sadece o adımı tamamlandı işaretle
                    ogrenci.gorevler[gIndex].altAdimlar[veri.adimIndex].tamamlandi = true;

                    // Bütün zincir bitti mi diye kontrol et
                    let hepsiBittiMi = ogrenci.gorevler[gIndex].altAdimlar.every(a => a.tamamlandi);

                    if (hepsiBittiMi && !ogrenci.gorevler[gIndex].tamamlandi) {
                        ogrenci.gorevler[gIndex].tamamlandi = true;
                        ogrenci.xp = Number(ogrenci.xp || 0) + 25; // 🚀 ZİNCİRİ BİTİRME BONUSU: +25 XP!

                        // Düello kontrolü (Normal görev bitirme ile aynı)
                        if (ogrenci.aktifDuello && ogrenci.aktifDuello.rakip) {
                            let rakipOgrenci = await Ogrenci.findOne({ ogrenciAd: ogrenci.aktifDuello.rakip, kocKodu: veri.kocKodu });
                            if (rakipOgrenci) {
                                let kazanilanXP = ogrenci.aktifDuello.miktar;
                                ogrenci.xp += kazanilanXP;
                                rakipOgrenci.xp -= kazanilanXP;
                                if (rakipOgrenci.xp < 0) { rakipOgrenci.xp = 0; }
                                rakipOgrenci.aktifDuello = null;
                                await rakipOgrenci.save();
                                io.to(veri.kocKodu).emit('duello_sonucu', { kazanan: ogrenci.ogrenciAd, kaybeden: rakipOgrenci.ogrenciAd, miktar: kazanilanXP });
                            }
                            ogrenci.aktifDuello = null;
                        }
                    }

                    ogrenci.markModified('gorevler');
                    await ogrenci.save();

                    let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                    io.to(veri.kocKodu).emit('gorev_guncellendi', list);
                }
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('gorev_tamamlandi', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci && ogrenci.gorevler) {
                let gIndex = ogrenci.gorevler.findIndex(g => Number(g.id) === Number(veri.gorevId));
                if (gIndex !== -1 && ogrenci.gorevler[gIndex].tamamlandi === false) {
                    ogrenci.gorevler[gIndex].tamamlandi = true;
                    ogrenci.xp = Number(ogrenci.xp || 0) + 10;

                    if (ogrenci.aktifDuello && ogrenci.aktifDuello.rakip) {
                        let rakipOgrenci = await Ogrenci.findOne({ ogrenciAd: ogrenci.aktifDuello.rakip, kocKodu: veri.kocKodu });
                        if (rakipOgrenci) {
                            let kazanilanXP = ogrenci.aktifDuello.miktar;
                            ogrenci.xp += kazanilanXP;
                            rakipOgrenci.xp -= kazanilanXP;
                            if (rakipOgrenci.xp < 0) { rakipOgrenci.xp = 0; }
                            rakipOgrenci.aktifDuello = null;
                            await rakipOgrenci.save();

                            io.to(veri.kocKodu).emit('duello_sonucu', { kazanan: ogrenci.ogrenciAd, kaybeden: rakipOgrenci.ogrenciAd, miktar: kazanilanXP });
                        }
                        ogrenci.aktifDuello = null;
                    }

                    ogrenci.markModified('gorevler');
                    await ogrenci.save();

                    let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                    io.to(veri.kocKodu).emit('gorev_guncellendi', list);
                }
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('calisma_plani_ekle', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                if (!ogrenci.calismaProgrami) ogrenci.calismaProgrami = [];

                ogrenci.calismaProgrami.push({
                    id: Date.now(),
                    metin: veri.planMetni,
                    tamamlandi: false,
                    tarih: veri.tarih || new Date().toLocaleDateString('tr-TR')
                });

                ogrenci.markModified('calismaProgrami');
                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('calisma_plani_tamamla', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci && ogrenci.calismaProgrami) {
                let pIndex = ogrenci.calismaProgrami.findIndex(p => Number(p.id) === Number(veri.planId));
                if (pIndex !== -1) {
                    ogrenci.calismaProgrami[pIndex].tamamlandi = veri.tamamlandi;

                    if (veri.tamamlandi) {
                        ogrenci.xp = Number(ogrenci.xp || 0) + 2;
                    }

                    ogrenci.markModified('calismaProgrami');
                    await ogrenci.save();

                    let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                    io.to(veri.kocKodu).emit('gorev_guncellendi', list);
                }
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('calisma_plani_sil', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci && ogrenci.calismaProgrami) {
                ogrenci.calismaProgrami = ogrenci.calismaProgrami.filter(p => Number(p.id) !== Number(veri.planId));
                ogrenci.markModified('calismaProgrami');
                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('duello_teklif_et', (veri) => {
        io.to(veri.kocKodu).emit('duello_istegi_geldi', veri);
    });

    socket.on('duello_kabul_edildi', async (veri) => {
        try {
            let o1 = await Ogrenci.findOne({ ogrenciAd: veri.gonderen, kocKodu: veri.kocKodu });
            let o2 = await Ogrenci.findOne({ ogrenciAd: veri.hedef, kocKodu: veri.kocKodu });
            if (o1 && o2) {
                o1.aktifDuello = { rakip: veri.hedef, miktar: veri.miktar };
                o2.aktifDuello = { rakip: veri.gonderen, miktar: veri.miktar };
                await o1.save();
                await o2.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
                io.to(veri.kocKodu).emit('duello_basladi', { o1: veri.gonderen, o2: veri.hedef });
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('yeni_kaynak_ekle', async (veri) => {
        try {
            const yeniKaynak = new Kaynak({ id: Date.now(), kocKodu: veri.kocKodu, baslik: veri.baslik, url: veri.url, tarih: new Date().toLocaleDateString('tr-TR') });
            await yeniKaynak.save();
            io.to(veri.kocKodu).emit('yeni_kaynak_eklendi', yeniKaynak);
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('kaynak_sil', async (veri) => {
        try {
            await Kaynak.deleteOne({ id: veri.id, kocKodu: veri.kocKodu });
            const list = await Kaynak.find({ kocKodu: veri.kocKodu }).sort({ id: -1 });
            io.to(veri.kocKodu).emit('kaynaklari_yukle', list);
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('kaynak_cozuldu', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                if (!ogrenci.tamamlananKaynaklar) ogrenci.tamamlananKaynaklar = [];

                if (!ogrenci.tamamlananKaynaklar.includes(veri.kaynakId)) {
                    ogrenci.tamamlananKaynaklar.push(veri.kaynakId);
                    ogrenci.xp += 5;
                    ogrenci.markModified('tamamlananKaynaklar');
                    await ogrenci.save();

                    let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                    io.to(veri.kocKodu).emit('gorev_guncellendi', list);

                    io.to(veri.kocKodu).emit('ogretmene_market_bildirimi', {
                        ogrenci: veri.ogrenciAd,
                        odul: `📚 "${veri.kaynakBaslik}" kaynağını bitirdi! (+5 XP)`
                    });
                }
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('ogrenci_derse_basladi', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                ogrenci.ders = veri.ders;
                ogrenci.mesaj = veri.mesaj;
                await ogrenci.save();
            }
            io.to(veri.kocKodu).emit('ogretmene_canli_bildirim', ogrenci);
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('avatar_guncelle', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                ogrenci.avatar = veri.avatar;
                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('istatistik_guncelle', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                let stats = ogrenci.istatistik || {};
                stats[veri.ders] = veri.ms;
                ogrenci.istatistik = stats;
                ogrenci.markModified('istatistik');
                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
            }
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('finans_guncelle', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                let currentFinans = ogrenci.finans || {};
                currentFinans.bakiye = veri.bakiye;
                ogrenci.finans = currentFinans;
                ogrenci.markModified('finans');
                await ogrenci.save();

                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list);
            }
        } catch (e) { console.error("Finans Güncelleme Hatası:", e); }
    });

    socket.on('chat_mesaji_gonder', async (data) => {
        try {
            const n = new Chat({
                id: Date.now(),
                gonderen: data.gonderen,
                mesaj: data.mesaj,
                rol: data.rol,
                saat: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                tip: data.tip || 'metin',
                kocKodu: data.kocKodu
            });
            await n.save();
            io.to(data.kocKodu).emit('yeni_chat_mesaji', n);
        } catch (e) { console.error("🔴 Sistem Hatası (Socket):", e); }
    });

    socket.on('sure_guncelle', (veri) => {
        io.to(veri.kocKodu).emit('ogretmene_sure_guncelle', veri);
    });

    // --- 🤖 GERÇEK GEMINI YAPAY ZEKA ASİSTAN ENTEGRASYONU ---

    const MEB_VERITABANI_PROMPT = `
    Öğrenciye görev veya kaynak önerirken mutlaka MEB'in tamamen telifsiz, resmi ve ücretsiz eğitim kaynaklarını kullanmalısın. 
    İşte tavsiye edebileceğin MEB Arşivi:
    1. Konu Anlatımı ve Özetler için: "MEB OGM Materyal (ogmmateryal.eba.gov.tr)"
    2. Soru Bankası ve Testler için: "MEB Kazanım Kavrama Testleri (odsgm.meb.gov.tr)"
    3. YKS Hazırlığı için: "EBA Akademik Destek ve 3 Adım Soru Bankası Modülleri"
    Raporlarında bu resmi kaynak isimlerini mutlaka geçir. Öğrenci bir konu anlamadıysa doğrudan bu platformlardan döküman veya test incelemesini iste.
    `;

    socket.on('yapay_zeka_analiz_istegi', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (!ogrenci) return;

            let xp = ogrenci.xp || 0;
            let isiHaritasi = JSON.stringify(ogrenci.isiHaritasi || {});
            let bekleyenHatalar = ogrenci.hataDefteri ? ogrenci.hataDefteri.filter(h => h.durum === 'Bekliyor').length : 0;

            let prompt = `
            Sen SincAPP adlı yeni nesil oyunlaştırılmış eğitim sisteminin baş yapay zeka koçusun. Adın "Kaptan".
            Sert, disiplinli ama öğrencisini çok seven, motive edici bir üslubun var.
            
            Şu anda analiz ettiğin öğrencinin adı: ${veri.ogrenciAd}
            Mevcut Deneyim Puanı (XP): ${xp}
            Çözemediği Bekleyen Soru Sayısı: ${bekleyenHatalar}
            Konu Isı Haritası (Zayıf, Orta, İyi): ${isiHaritasi}

            ${MEB_VERITABANI_PROMPT}

            Lütfen bu verilere bakarak:
            1. HTML formatında (<b>, <br>, <span style="color:red"> gibi etiketler kullanarak) şık, kısa ve nokta atışı bir "Durum Raporu ve Motivasyon" metni yaz. Zayıf konuları vurgularken MEB kaynaklarını tavsiye et.
            2. Öğrenciye özel, MEB OGM Materyal veya Kazanım Testlerinden birini içeren 1 adet spesifik eylem "Görev" cümlesi yaz (Maksimum 8-10 kelime).
            
            ÖNEMLİ: Bana sadece şu formatta JSON dön (başka açıklama veya markdown ekleme):
            {"rapor": "html formatındaki rapor metni", "oneri": "görev cümlesi"}
            `;

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro",
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;

            let textRes = response.text();
            // Gemini bazen markdown formatında döner, onu temizle
            textRes = textRes.replace(/```json/gi, '').replace(/```/g, '').trim();
            let aiData = JSON.parse(textRes);

            io.to(veri.kocKodu).emit('yapay_zeka_raporu', {
                ad: veri.ogrenciAd,
                rapor: aiData.rapor,
                oneri: aiData.oneri
            });
        } catch (err) {
            console.error("Yapay Zeka Hatası (Analiz):", err);
            io.to(veri.kocKodu).emit('yapay_zeka_raporu', {
                ad: veri.ogrenciAd,
                rapor: "<span style='color:red;'>🚨 Kaptan'ın telsiz bağlantısı koptu. Lütfen daha sonra tekrar deneyin.</span>",
                oneri: "API bağlantısını kontrol et."
            });
        }
    });

    socket.on('veli_yapay_zeka_raporu_iste', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd });
            if (!ogrenci) return;

            let xp = ogrenci.xp || 0;
            let isiHaritasi = JSON.stringify(ogrenci.isiHaritasi || {});
            let tamamlananGorevler = ogrenci.gorevler ? ogrenci.gorevler.filter(g => g.tamamlandi).length : 0;
            let bekleyenGorevler = ogrenci.gorevler ? ogrenci.gorevler.filter(g => !g.tamamlandi).length : 0;

            let prompt = `
            Sen profesyonel bir eğitim koçusun. Adın KatalizApp Yapay Zeka Danışmanı.
            Şu anda analiz ettiğin öğrencinin adı: ${veri.ogrenciAd}
            Öğrencinin Mevcut Deneyim Puanı (XP): ${xp}
            Tamamladığı Görev Sayısı: ${tamamlananGorevler}
            Bekleyen Görev Sayısı: ${bekleyenGorevler}
            Konu Isı Haritası (Zayıf, Orta, İyi): ${isiHaritasi}

            Lütfen bu verilere bakarak, öğrencinin velisine hitaben HTML formatında (<b>, <br> kullanarak) profesyonel, şefkatli ve yönlendirici bir "Haftalık Durum Özeti" yaz. 
            Eğer zayıf konuları varsa veya görevleri aksatıyorsa veliye nazikçe uyarıda bulun. 

            ÖNEMLİ: Bana sadece şu formatta JSON dön (başka açıklama veya markdown ekleme):
            {"rapor": "html formatındaki rapor metni"}
            `;

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent(prompt);
            let textRes = (await result.response).text().replace(/```json/gi, '').replace(/```/g, '').trim();
            let aiData = JSON.parse(textRes);

            socket.emit('veli_yapay_zeka_raporu_geldi', aiData.rapor);
        } catch (err) {
            console.error("Veli AI Rapor Hatası:", err);
            socket.emit('veli_yapay_zeka_raporu_geldi', "<span style='color:red;'>🚨 Yapay Zeka şu an analiz yapamıyor. Lütfen daha sonra tekrar deneyin.</span>");
        }
    });

    socket.on('net_analizi_iste', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd });
            if (!ogrenci || !ogrenci.netler || ogrenci.netler.length < 2) {
                return socket.emit('net_analizi_geldi', "Yeterli net verisi yok. Analiz için en az 2 deneme girmelisin.");
            }

            let sonNetler = ogrenci.netler.slice(-5);
            let netGecmisi = JSON.stringify(sonNetler.map(n => ({ tarih: n.tarih, turkce: n.turkce, mat: n.mat, fen: n.fen, sos: n.sos })));

            let prompt = `
            Sen profesyonel bir eğitim koçusun. Adın "Kaptan".
            Öğrencinin adı: ${veri.ogrenciAd}
            Öğrencinin son deneme sınavı net geçmişi (JSON formatında): ${netGecmisi}

            Bu verilere bakarak, öğrencinin deneme performansını HTML formatında (<b>, <br> kullanarak) analiz et. 
            Hangi derslerde yükseliş var, hangilerinde düşüş var? Kısa, motive edici ve nokta atışı bir analiz yaz.
            
            ÖNEMLİ: Bana sadece şu formatta JSON dön (başka açıklama veya markdown ekleme):
            {"analiz": "html formatındaki analiz metni"}
            `;

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent(prompt);
            let textRes = (await result.response).text().replace(/```json/gi, '').replace(/```/g, '').trim();
            let aiData = JSON.parse(textRes);

            socket.emit('net_analizi_geldi', aiData.analiz);
        } catch (err) {
            console.error("Net Analizi Hatası:", err);
            socket.emit('net_analizi_geldi', "<span style='color:red;'>🚨 Net analizi yapılamadı.</span>");
        }
    });

    socket.on('ogrenci_chatbot_mesaji', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (!ogrenci) return;

            let xp = ogrenci.xp || 0;
            let rütbe = xp >= 300 ? 'Efsane' : xp >= 150 ? 'Odak Ustası' : 'Çaylak';
            let bekleyenGorev = ogrenci.gorevler ? ogrenci.gorevler.filter(g => !g.tamamlandi).length : 0;

            let prompt = `
            Sen SincAPP eğitim sisteminin sevimli, motive edici ve zeki asistanısın.
            Şu an konuştuğun öğrencinin adı: ${veri.ogrenciAd}
            Öğrencinin Mevcut XP'si: ${xp} (Sistemdeki Rütbesi: ${rütbe})
            Öğrencinin Bekleyen/Yapılmamış Görev Sayısı: ${bekleyenGorev}

            ${MEB_VERITABANI_PROMPT}

            Öğrencinin sana yazdığı mesaj: "${veri.mesaj}"

            Görevlerin:
            1. Öğrenciye ismiyle veya rütbesiyle (Örn: Çaylak, Efsane) hitap et.
            2. Eğer öğrenci kaynak, soru, döküman veya konu eksiği sorarsa ona anında MEB OGM Materyal veya Kazanım Testlerini kullanmasını tavsiye et. Aksi takdirde normal sohbete devam et.
            3. Mesajına samimi, hafif esprili ve kısa bir cevap ver (Maksimum 2-3 cümle olsun).
            4. Markdown (* veya # gibi) özel etiketler kullanma, düz ve doğal bir mesaj yaz.
            
            ÖNEMLİ: Bana sadece şu formatta JSON dön (başka açıklama veya markdown ekleme):
            {"cevap": "senin yazacağın cevap metni"}
            `;

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;

            let textRes = response.text();
            // Hatalı markdown formatlamalarını temizle
            textRes = textRes.replace(/```json/gi, '').replace(/```/g, '').trim();
            let aiData = JSON.parse(textRes);

            socket.emit('chatbot_cevabi', aiData.cevap);

        } catch (err) {
            console.error("Öğrenci Chatbot Hatası:", err);
            socket.emit('chatbot_cevabi', "Şu an sunucu odasında ufak bir tozlanma var, Kaptan'ın kabloları temizlemesini bekliyorum. Birazdan tekrar yaz! 🛠️");
        }
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 SincAPP Çalışıyor! Port: ${PORT}`);
});