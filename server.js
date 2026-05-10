require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Güvenlik ayarı: API Anahtarın artık .env dosyasından güvenli bir şekilde çekiliyor
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(express.json());
app.use(express.static('public'));

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
    finans: { type: Object, default: {} } 
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
    aktiviteGecmisi: { type: Array, default: [] }
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
// 2. HTTP API İŞLEMLERİ (GÜVENLİ)
// ==========================================

app.post('/api/admin', async (req, res) => { 
    const { sifre } = req.body; 
    if (sifre === process.env.ADMIN_PASS) { 
        let koclar = await Ogretmen.find(); 
        let ogrler = await Ogrenci.find(); 
        res.json({ basari: true, data: { koclar, ogrler } }); 
    } else { 
        res.json({ basari: false }); 
    } 
});

app.post('/api/admin/finans_kaydet', async (req, res) => {
    const { sifre, kocKodu, finans } = req.body;
    if (sifre === process.env.ADMIN_PASS) {
        await Ogretmen.updateOne({ kocKodu: kocKodu }, { finans: finans });
        res.json({ basari: true });
    } else { 
        res.json({ basari: false }); 
    }
});

app.post('/api/admin/sil', async (req, res) => { 
    const { sifre, kod } = req.body; 
    if (sifre === process.env.ADMIN_PASS) { 
        await Ogretmen.deleteOne({ kocKodu: kod }); 
        await Ogrenci.deleteMany({ kocKodu: kod }); 
        await Chat.deleteMany({ kocKodu: kod }); 
        await Kaynak.deleteMany({ kocKodu: kod }); 
        res.json({ basari: true }); 
    } else { 
        res.json({ basari: false }); 
    } 
});

app.post('/api/admin/sil_ogrenci', async (req, res) => { 
    const { sifre, ogrenciId } = req.body; 
    if (sifre === process.env.ADMIN_PASS) { 
        await Ogrenci.findByIdAndDelete(ogrenciId); 
        res.json({ basari: true }); 
    } else { 
        res.json({ basari: false }); 
    } 
});

app.post('/api/admin/sifre_sifirla_ogrenci', async (req, res) => { 
    const { sifre, ogrenciId } = req.body; 
    if (sifre === process.env.ADMIN_PASS) { 
        const tuz = await bcrypt.genSalt(10);
        const hashliSifre = await bcrypt.hash("123456", tuz);
        await Ogrenci.findByIdAndUpdate(ogrenciId, { sifre: hashliSifre }); 
        res.json({ basari: true }); 
    } else { 
        res.json({ basari: false }); 
    } 
});

app.post('/api/admin/sifre_sifirla_koc', async (req, res) => { 
    const { sifre, kocKodu } = req.body; 
    if (sifre === process.env.ADMIN_PASS) { 
        const tuz = await bcrypt.genSalt(10);
        const hashliSifre = await bcrypt.hash("123456", tuz);
        await Ogretmen.findOneAndUpdate({ kocKodu: kocKodu }, { sifre: hashliSifre }); 
        res.json({ basari: true }); 
    } else { 
        res.json({ basari: false }); 
    } 
});

app.post('/api/koc/kayit', async (req, res) => { 
    try { 
        const { kocAd, sifre } = req.body; 
        let varMi = await Ogretmen.findOne({ kocAd }); 
        
        if (varMi) {
            return res.json({ basari: false, mesaj: "Bu eğitmen ismi zaten alınmış!" }); 
        }
        
        const tuz = await bcrypt.genSalt(10);
        const hashliSifre = await bcrypt.hash(sifre, tuz);
        
        let yeniKod = Math.random().toString(36).substr(2, 6).toUpperCase(); 
        let yeniKoc = new Ogretmen({ kocAd, sifre: hashliSifre, kocKodu: yeniKod, finans: {} }); 
        
        await yeniKoc.save(); 
        res.json({ basari: true, mesaj: `Kaydınız yapıldı. Davet Kodunuz: ${yeniKod}`, kocKodu: yeniKod }); 
    } catch (e) { 
        res.json({ basari: false }); 
    } 
});

app.post('/api/koc/giris', async (req, res) => { 
    try { 
        const { kocAd, sifre } = req.body; 
        let koc = await Ogretmen.findOne({ kocAd }); 
        
        if (koc) {
            const uyusuyorMu = await bcrypt.compare(sifre, koc.sifre);
            if(uyusuyorMu) {
                return res.json({ basari: true, kocKodu: koc.kocKodu });
            }
        }
        res.json({ basari: false, mesaj: "Hatalı isim veya şifre!" }); 
    } catch (e) { 
        res.json({ basari: false }); 
    } 
});

app.post('/api/kayit', async (req, res) => { 
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
        
        const tuz = await bcrypt.genSalt(10);
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
    } catch (e) { 
        res.json({ basari: false }); 
    } 
});

app.post('/api/giris', async (req, res) => { 
    try { 
        const { ogrenciAd, sifre } = req.body; 
        let ogrenci = await Ogrenci.findOne({ ogrenciAd }); 
        
        if (ogrenci) { 
            const uyusuyorMu = await bcrypt.compare(sifre, ogrenci.sifre);
            if(uyusuyorMu) {
                return res.json({ basari: true, kocKodu: ogrenci.kocKodu, veliKodu: ogrenci.veliKodu }); 
            }
        }
        res.json({ basari: false, mesaj: "Kullanıcı adı veya şifre hatalı!" }); 
    } catch (e) { 
        res.json({ basari: false }); 
    } 
});

app.post('/api/veli/giris', async (req, res) => { 
    try { 
        let ogrenci = await Ogrenci.findOne({ veliKodu: req.body.veliKodu }); 
        
        if (ogrenci) {
            res.json({ basari: true, ogrenciAd: ogrenci.ogrenciAd, kocKodu: ogrenci.kocKodu }); 
        } else {
            res.json({ basari: false, mesaj: "Veli Takip Kodu bulunamadı!" }); 
        }
    } catch (e) { 
        res.json({ basari: false }); 
    } 
});

app.post('/api/sifreler', async (req, res) => { 
    try { 
        let ogrenciler = await Ogrenci.find({ kocKodu: req.body.kocKodu }, 'ogrenciAd veliKodu -_id'); 
        res.json(ogrenciler); 
    } catch (e) { 
        res.json([]); 
    } 
});

// ==========================================
// 3. SOCKET.IO (CANLI VERİ AKIŞI)
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
            
            const eskiChat = await Chat.find({ kocKodu }).sort({_id: -1}).limit(50); 
            socket.emit('eski_chat_yukle', eskiChat.reverse()); 
            
            const eskiKaynaklar = await Kaynak.find({ kocKodu }).sort({id: -1}); 
            socket.emit('kaynaklari_yukle', eskiKaynaklar); 
        } catch (hata) {
            console.error("Join Room Hatası:", hata);
        } 
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
        } catch(e) {} 
    });

    socket.on('masa_basi_uyarisi', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if(ogrenci) {
                ogrenci.ders = "MASA BAŞINDAN AYRILDI";
                ogrenci.mesaj = "Sistem tarafından otomatik durduruldu.";
                await ogrenci.save();

                io.to(veri.kocKodu).emit('ogretmene_canli_bildirim', ogrenci);
                io.to(veri.kocKodu).emit('afk_kacak_ogrenci', {
                    ogrenciAd: veri.ogrenciAd,
                    mesaj: "🚨 DİKKAT! Öğrenci yoklamaya cevap vermedi, masada değil!"
                });
            }
        } catch(e) {}
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
        } catch(e) {} 
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
        } catch(e) {}
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
        } catch(e) {} 
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
        } catch(e) {} 
    });

    socket.on('hata_sorusu_ekle', async (veri) => { 
        try { 
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu }); 
            if (ogrenci) { 
                let yeniSoru = { id: Date.now(), resim: veri.resim, dersKonu: veri.dersKonu, durum: 'Bekliyor', tarih: new Date().toLocaleDateString('tr-TR') }; 
                ogrenci.hataDefteri.push(yeniSoru); 
                ogrenci.markModified('hataDefteri'); 
                await ogrenci.save(); 
                
                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list); 
                io.to(veri.kocKodu).emit('ogretmene_market_bildirimi', { ogrenci: veri.ogrenciAd, odul: "Hata Defterine Soru Yükledi" }); 
            } 
        } catch(e) {} 
    });

    socket.on('hata_sorusu_cozuldu', async (veri) => { 
        try { 
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu }); 
            if (ogrenci && ogrenci.hataDefteri) { 
                let idx = ogrenci.hataDefteri.findIndex(h => h.id === veri.soruId); 
                if (idx !== -1) { 
                    ogrenci.hataDefteri[idx].durum = 'Çözüldü'; 
                    ogrenci.markModified('hataDefteri'); 
                    await ogrenci.save(); 
                    
                    let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                    io.to(veri.kocKodu).emit('gorev_guncellendi', list); 
                } 
            } 
        } catch(e) {} 
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
        } catch(e) {} 
    });

    socket.on('aktivite_kaydet', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                if(!ogrenci.aktiviteGecmisi) ogrenci.aktiviteGecmisi = [];
                
                if(veri.sure >= 60000) {
                    ogrenci.aktiviteGecmisi.unshift({
                        id: Date.now(),
                        tarih: new Date().toLocaleDateString('tr-TR'),
                        saat: new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}),
                        ders: veri.ders,
                        sureMs: veri.sure,
                        tip: veri.tip || 'Çalışma'
                    });

                    if(ogrenci.aktiviteGecmisi.length > 50) {
                        ogrenci.aktiviteGecmisi.pop();
                    }

                    ogrenci.markModified('aktiviteGecmisi');
                    await ogrenci.save();

                    let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                    io.to(veri.kocKodu).emit('gorev_guncellendi', list);
                }
            }
        } catch(e) {}
    });

    socket.on('yeni_gorev_ekle', async (veri) => { 
        try { 
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu }); 
            if (ogrenci) { 
                ogrenci.gorevler.push({ id: Date.now(), metin: veri.gorevMetni, tamamlandi: false }); 
                ogrenci.markModified('gorevler'); 
                await ogrenci.save(); 
                
                let list = await Ogrenci.find({ kocKodu: veri.kocKodu });
                io.to(veri.kocKodu).emit('gorev_guncellendi', list); 
            } 
        } catch(e) {} 
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
        } catch(e) {} 
    });

    socket.on('calisma_plani_ekle', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                if(!ogrenci.calismaProgrami) ogrenci.calismaProgrami = [];
                
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
        } catch(e) {}
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
        } catch(e) {}
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
        } catch(e) {}
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
        } catch(e) {} 
    });

    socket.on('yeni_kaynak_ekle', async (veri) => { 
        try { 
            const yeniKaynak = new Kaynak({ id: Date.now(), kocKodu: veri.kocKodu, baslik: veri.baslik, url: veri.url, tarih: new Date().toLocaleDateString('tr-TR') }); 
            await yeniKaynak.save(); 
            io.to(veri.kocKodu).emit('yeni_kaynak_eklendi', yeniKaynak); 
        } catch(e) {} 
    });

    socket.on('kaynak_sil', async (veri) => { 
        try { 
            await Kaynak.deleteOne({ id: veri.id, kocKodu: veri.kocKodu }); 
            const list = await Kaynak.find({ kocKodu: veri.kocKodu }).sort({id: -1}); 
            io.to(veri.kocKodu).emit('kaynaklari_yukle', list); 
        } catch(e) {} 
    });

    socket.on('kaynak_cozuldu', async (veri) => {
        try {
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu });
            if (ogrenci) {
                if(!ogrenci.tamamlananKaynaklar) ogrenci.tamamlananKaynaklar = [];
                
                if(!ogrenci.tamamlananKaynaklar.includes(veri.kaynakId)) {
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
        } catch(e){}
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
        } catch(e) {} 
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
        } catch(e) {} 
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
        } catch(e) {} 
    });

    socket.on('chat_mesaji_gonder', async (data) => { 
        try { 
            const n = new Chat({ 
                id: Date.now(), 
                gonderen: data.gonderen, 
                mesaj: data.mesaj, 
                rol: data.rol, 
                saat: new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}), 
                tip: data.tip || 'metin', 
                kocKodu: data.kocKodu 
            }); 
            await n.save(); 
            io.to(data.kocKodu).emit('yeni_chat_mesaji', n); 
        } catch(e) {} 
    });

    socket.on('sure_guncelle', (veri) => { 
        io.to(veri.kocKodu).emit('ogretmene_sure_guncelle', veri); 
    });

    // ==========================================
    // 🎨 AKILLI TAHTA (CANLI YAYIN) İŞLEMLERİ
    // ==========================================

    socket.on('tahta_aktiflesiyor', (veri) => {
        // Öğretmen tahtayı açtı veya kapattı. Bunu tüm sınıfa (veli hariç) bildir.
        // veri = { kocKodu: 'XYZ', acik: true/false }
        socket.to(veri.kocKodu).emit('canli_tahta_durumu', veri);
    });

    socket.on('tahta_cizim_yap', (veri) => {
        // Öğretmenden gelen çizim koordinatlarını, fırça kalınlığını ve rengi sınıfa dağıt.
        // veri = { kocKodu: 'XYZ', x0: 10, y0: 20, x1: 15, y1: 25, renk: '#fff', kalinlik: 3, temizle: false }
        socket.to(veri.kocKodu).emit('canli_cizim_geldi', veri);
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
            let bekleyenHatalar = ogrenci.hataDefteri ? ogrenci.hataDefteri.filter(h=>h.durum==='Bekliyor').length : 0;

            let prompt = `
            Sen KatalizApp adlı yeni nesil oyunlaştırılmış eğitim sisteminin baş yapay zeka koçusun. Adın "Kaptan".
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

            // 🔥 ZIRHLI AI BAĞLANTISI (JSON FORMAT ZORUNLULUĞU)
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-pro",
                generationConfig: { responseMimeType: "application/json" }
            });
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            
            let aiData = JSON.parse(response.text()); // Zırh sayesinde metin temizlemeye gerek kalmadı

            io.to(veri.kocKodu).emit('yapay_zeka_raporu', { 
                ad: veri.ogrenciAd, 
                rapor: aiData.rapor, 
                oneri: aiData.oneri 
            }); 
        } catch(err) {
            console.error("Yapay Zeka Hatası (Analiz):", err);
            io.to(veri.kocKodu).emit('yapay_zeka_raporu', { 
                ad: veri.ogrenciAd, 
                rapor: "<span style='color:red;'>🚨 Kaptan'ın telsiz bağlantısı koptu. Lütfen daha sonra tekrar deneyin.</span>", 
                oneri: "API bağlantısını kontrol et." 
            });
        } 
    });

// --- 🤖 ÖĞRENCİ PANELİ: GERÇEK YAPAY ZEKA SOHBET BOTU ---
    socket.on('ogrenci_chatbot_mesaji', async (veri) => { 
        try { 
            let ogrenci = await Ogrenci.findOne({ ogrenciAd: veri.ogrenciAd, kocKodu: veri.kocKodu }); 
            if (!ogrenci) return;

            let xp = ogrenci.xp || 0; 
            let rütbe = xp >= 300 ? 'Efsane' : xp >= 150 ? 'Odak Ustası' : 'Çaylak'; 
            let bekleyenGorev = ogrenci.gorevler ? ogrenci.gorevler.filter(g => !g.tamamlandi).length : 0;

            let prompt = `
            Sen KatalizApp eğitim sisteminin sevimli, motive edici ve zeki asistanısın.
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

            // 🔥 ZIRHLI AI BAĞLANTISI (JSON FORMAT ZORUNLULUĞU)
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            
            let aiData = JSON.parse(response.text());
            
            socket.emit('chatbot_cevabi', aiData.cevap); 

        } catch(err) { 
            console.error("Öğrenci Chatbot Hatası:", err);
            socket.emit('chatbot_cevabi', "Şu an sunucu odasında ufak bir tozlanma var, Kaptan'ın kabloları temizlemesini bekliyorum. Birazdan tekrar yaz! 🛠️"); 
        } 
    });
    
});

const PORT = process.env.PORT || 3000; 
server.listen(PORT, () => { 
    console.log(`🚀 KatalizApp Çalışıyor! Port: ${PORT}`); 
});