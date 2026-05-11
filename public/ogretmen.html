const socket = io(); 
const aktifOgrenci = localStorage.getItem('ogrenciKimligi'); 
const kocKodu = localStorage.getItem('kocKodu'); 
const veliKodu = localStorage.getItem('veliKodu');

socket.emit('join_room', kocKodu);

if(document.getElementById('veliKoduGosterge')) { 
    document.getElementById('veliKoduGosterge').innerText = veliKodu || 'V-XXXX'; 
}

// ==========================================
// 1. GLOBAL DEĞİŞKENLER VE YARDIMCILAR
// ==========================================

let benimTamamlananKaynaklar = [];
let benimAktiviteGecmisim = [];

if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") { 
    Notification.requestPermission(); 
}

function sistemBildirimi(baslik, mesaj) { 
    if ("Notification" in window && Notification.permission === "granted") { 
        new Notification(baslik, { body: mesaj, icon: "https://cdn-icons-png.flaticon.com/512/616/616430.png" }); 
    } 
}

// 🔥 DUOLINGO TARZI SERİ (STREAK) SİSTEMİ
function seriKontrol() {
    let bugun = new Date().toLocaleDateString('tr-TR');
    let sonGiris = localStorage.getItem(`${aktifOgrenci}_sonGirisTarihi`);
    let seri = parseInt(localStorage.getItem(`${aktifOgrenci}_seriGunu`)) || 0;

    if (sonGiris !== bugun) {
        if (sonGiris) {
            let dun = new Date();
            dun.setDate(dun.getDate() - 1);
            if (sonGiris === dun.toLocaleDateString('tr-TR')) {
                seri++; 
            } else {
                seri = 1; 
                sistemBildirimi("❄️ Serin Bozuldu!", "Dün çalışmadığın için serin sıfırlandı. Bugün yeni bir başlangıç yapıyoruz!");
            }
        } else {
            seri = 1; 
        }
        
        localStorage.setItem(`${aktifOgrenci}_sonGirisTarihi`, bugun);
        localStorage.setItem(`${aktifOgrenci}_seriGunu`, seri);
        
        setTimeout(() => {
            socket.emit('calisma_plani_ekle', {
                ogrenciAd: aktifOgrenci,
                kocKodu: kocKodu,
                planMetni: `🔥 ${seri}. Gün Serisi: Bugünün ilk odaklanmasını tamamla!`
            });
        }, 1500);
    }
}

// 🏆 KUPA ODASI / ROZET KONTROL MOTORU
function rozetleriKontrolEt() {
    let kazanilan = 0;
    let bugun = new Date().toLocaleDateString('tr-TR');

    let rozet1 = document.getElementById('rozet_1');
    let rozet2 = document.getElementById('rozet_2');
    let rozet3 = document.getElementById('rozet_3');
    let rozet4 = document.getElementById('rozet_4');

    let seri = parseInt(localStorage.getItem(`${aktifOgrenci}_seriGunu`)) || 0;
    if (seri >= 7 && rozet1) {
        rozet1.classList.add('kazanildi');
        kazanilan++;
    }

    let bugunPomo = benimAktiviteGecmisim.filter(a => a.tarih === bugun && a.tip === 'Pomodoro').length;
    if (bugunPomo >= 5 && rozet2) {
        rozet2.classList.add('kazanildi');
        kazanilan++;
    }

    let geceCalistiMi = benimAktiviteGecmisim.some(a => {
        let saatStr = a.saat.split(':')[0];
        let saat = parseInt(saatStr);
        return (saat >= 0 && saat <= 5);
    });
    if (geceCalistiMi && rozet3) {
        rozet3.classList.add('kazanildi');
        kazanilan++;
    }

    if (localStorage.getItem(`${aktifOgrenci}_ejderhaAvcisi`) === 'true' && rozet4) {
        rozet4.classList.add('kazanildi');
        kazanilan++;
    }

    let gosterge = document.getElementById('kazanilanRozetSayisi');
    if(gosterge) gosterge.innerText = `${kazanilan}/4`;
}

// 🧠 ARALIKLI TEKRAR (SPACED REPETITION) GÜN HESAPLAMA
function gunFarkiHesapla(gecmisTarihStr) {
    if (!gecmisTarihStr) return 0;
    let parcalar = gecmisTarihStr.split('.');
    if (parcalar.length !== 3) return 0;
    
    let gecmisTarih = new Date(`${parcalar[2]}-${parcalar[1]}-${parcalar[0]}`);
    let bugun = new Date();
    
    gecmisTarih.setHours(0, 0, 0, 0);
    bugun.setHours(0, 0, 0, 0);
    
    let farkMs = Math.abs(bugun - gecmisTarih);
    return Math.floor(farkMs / (1000 * 60 * 60 * 24));
}

function resimSikistir(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; 
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const sıkistirilmisBase64 = canvas.toDataURL('image/jpeg', 0.6);
            callback(sıkistirilmisBase64);
        }
    };
}

function msToTime(duration) {
    if(!duration || isNaN(duration)) return "0 dk 0 sn";
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return (hours !== "00" ? hours + " sa " : "") + minutes + " dk " + seconds + " sn";
}

// ==========================================
// 2. MÜFREDAT VE PSİKOLOJİK TEST HAVUZU
// ==========================================

const MUFREDAT = { 
    "YKS": { 
        "TYT Türkçe": ["Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Ses Bilgisi", "Yazım Kuralları", "Noktalama İşaretleri", "Sözcükte Yapı", "Sözcük Türleri", "Fiiller ve Fiilimsiler", "Cümlenin Ögeleri", "Cümle Türleri", "Anlatım Bozuklukları"], 
        "TYT Matematik": ["Temel Kavramlar", "Sayı Basamakları", "Bölme ve Bölünebilme", "EBOB-EKOK", "Rasyonel Sayılar", "Ondalık Sayılar", "Basit Eşitsizlikler", "Mutlak Değer", "Üslü İfadeler", "Köklü İfadeler", "Çarpanlara Ayırma", "Denklem Çözme", "Oran ve Orantı", "Problemler (Sayı, Kesir, Yaş vb.)", "Problemler (Hareket, İşçi, Karışım vb.)", "Mantık", "Kümeler", "Fonksiyonlar", "Polinomlar", "Veri, Sayma ve Olasılık"], 
        "TYT Geometri": ["Doğruda ve Üçgende Açılar", "Dik ve Özel Üçgenler", "İkizkenar ve Eşkenar Üçgen", "Üçgende Alan ve Benzerlik", "Açıortay ve Kenarortay", "Çokgenler", "Dörtgenler (Kare, Dikdörtgen vb.)", "Çember ve Daire", "Analitik Geometri", "Katı Cisimler"], 
        "TYT Fizik": ["Fizik Bilimine Giriş", "Madde ve Özellikleri", "Hareket ve Kuvvet", "İş, Güç ve Enerji", "Isı, Sıcaklık ve Genleşme", "Elektrostatik", "Elektrik Akımı ve Devreler", "Manyetizma", "Basınç", "Kaldırma Kuvveti", "Dalgalar", "Optik"], 
        "TYT Kimya": ["Kimya Bilimi", "Atom ve Periyodik Sistem", "Kimyasal Türler Arası Etkileşimler", "Maddenin Halleri", "Doğa ve Kimya", "Kimyanın Temel Kanunları ve Mol", "Kimyasal Hesaplamalar", "Karışımlar", "Asitler, Bazlar ve Tuzlar", "Kimya Her Yerde"], 
        "TYT Biyoloji": ["Yaşam Bilimi Biyoloji", "Canlıların Temel Bileşenleri", "Hücre ve Organelleri", "Canlıların Dünyası (Sınıflandırma)", "Hücre Bölünmeleri (Mitoz-Mayoz)", "Kalıtım", "Ekosistem Ekolojisi", "Güncel Çevre Sorunları"], 
        "TYT Tarih": ["Tarih ve Zaman", "İnsanlığın İlk Dönemleri", "Orta Çağ'da Dünya", "İlk ve Orta Çağlarda Türk Dünyası", "İslam Medeniyetinin Doğuşu", "Türklerin İslamiyet'i Kabulü", "Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi", "Beylikten Devlete Osmanlı", "Dünya Gücü Osmanlı", "Değişim Çağında Avrupa ve Osmanlı", "En Uzun Yüzyıl", "20. Yüzyıl Başlarında Osmanlı", "Milli Mücadele", "Atatürkçülük ve Türk İnkılabı"], 
        "TYT Coğrafya": ["Doğa ve İnsan", "Dünya'nın Şekli ve Hareketleri", "Coğrafi Konum ve Koordinat Sistemi", "Harita Bilgisi", "Atmosfer ve İklim", "Türkiye'nin İklimi", "Yerin Yapısı ve Oluşum Süreci", "İç ve Dış Kuvvetler", "Su, Toprak ve Bitki", "Nüfus ve Yerleşme", "Göç", "Ekonomik Faaliyetler", "Bölgeler ve Ülkeler", "Doğal Afetler"], 
        "TYT Felsefe": ["Felsefeyi Tanıma", "Felsefeyle Düşünme", "Varlık Felsefesi", "Bilgi Felsefesi", "Bilim Felsefesi", "Ahlak Felsefesi", "Din Felsefesi", "Siyaset Felsefesi", "Sanat Felsefesi"], 
        "TYT Din Kültürü": ["Bilgi ve İnanç", "Din ve İslam", "İslam ve İbadet", "Gençlik ve Değerler", "Allah İnsan İlişkisi", "Hz. Muhammed", "Vahiy ve Akıl", "İslam Düşüncesinde Yorumlar"], 
        "AYT Matematik": ["Polinomlar", "2. Dereceden Denklemler ve Eşitsizlikler", "Parabol", "Trigonometri", "Logaritma", "Diziler ve Seriler", "Limit ve Süreklilik", "Türev", "İntegral", "Sayma ve Olasılık"], 
        "AYT Edebiyat": ["Güzel Sanatlar ve Edebiyat", "Şiir Bilgisi", "Söz Sanatları", "İslamiyet Öncesi Türk Edebiyatı", "Geçiş Dönemi Türk Edebiyatı", "Halk Edebiyatı", "Divan Edebiyatı", "Tanzimat Edebiyatı", "Servetifünun ve Fecriati Edebiyatı", "Milli Edebiyat Dönemi", "Cumhuriyet Dönemi Edebiyatı", "Edebi Akımlar"], 
        "AYT Fizik": ["Vektörler ve Bağıl Hareket", "Newton'un Hareket Yasaları", "Atışlar ve Bir Boyutta Hareket", "İş, Enerji ve Güç", "İtme ve Çizgisel Momentum", "Tork ve Denge", "Basit Makineler", "Elektriksel Kuvvet, Potansiyel ve İş", "Paralel Levhalar ve Sığa", "Manyetizma ve Elektromanyetik İndüklenme", "Alternatif Akım ve Transformatör", "Çembersel Hareket", "Basit Harmonik Hareket", "Dalga Mekaniği", "Atom Fiziğine Giriş ve Radyoaktivite", "Modern Fizik", "Modern Fiziğin Teknolojideki Uygulamaları"], 
        "AYT Kimya": ["Modern Atom Teorisi", "Gazlar", "Sıvı Çözeltiler ve Çözünürlük", "Kimyasal Tepkimelerde Enerji", "Kimyasal Tepkimelerde Hız", "Kimyasal Tepkimelerde Denge", "Asit-Baz Dengesi", "Çözünürlük Dengesi (Kçç)", "Kimya ve Elektrik (Elektrokimya)", "Karbon Kimyasına Giriş", "Organik Kimya"], 
        "AYT Biyoloji": ["Sinir Sistemi", "Endokrin Sistem", "Duyu Organları", "Destek ve Hareket Sistemi", "Sindirim Sistemi", "Dolaşım Sistemi", "Solunum Sistemi", "Üriner Sistem (Boşaltım)", "Üreme Sistemi ve Embriyonik Gelişim", "Komünite ve Popülasyon Ekolojisi", "Nükleik Asitler ve Protein Sentezi", "Fotosentez ve Kemosentez", "Hücresel Solunum", "Bitki Biyolojisi"], 
        "AYT Tarih": ["Tarih ve Zaman", "İnsanlığın İlk Dönemleri", "Orta Çağ'da Dünya", "İlk ve Orta Çağlarda Türk Dünyası", "İslam Medeniyetinin Doğuşu", "Türklerin İslamiyet'i Kabulü ve İlk Türk İslam Devletleri", "Türkiye Tarihi (11-13. Yüzyıllar)", "Osmanlı Devleti (Kuruluş, Yükselme, Duraklama, Gerileme, Dağılma)", "20. Yüzyıl Başlarında Osmanlı", "Milli Mücadele", "Atatürkçülük ve Türk İnkılabı", "İki Savaş Arasındaki Dönemde Türkiye ve Dünya", "II. Dünya Savaşı Sürecinde Türkiye ve Dünya", "Soğuk Savaş Dönemi", "Yumuşama (Detant) Dönemi ve Sonrası", "Küreselleşen Dünya"], 
        "AYT Coğrafya": ["Biyoçeşitlilik ve Ekosistem", "Şehirlerin Fonksiyonları ve Etki Alanları", "Türkiye'nin Nüfus Politikaları ve Projeksiyonları", "Türkiye'de Tarım, Hayvancılık ve Ormancılık", "Türkiye'de Madenler ve Enerji Kaynakları", "Türkiye'de Sanayi", "Türkiye'de Ulaşım ve Turizm", "Ülkeler ve Bölgeler", "Çevre Sorunları ve Koruma", "Küresel ve Bölgesel Örgütler"], 
        "Genel Deneme": ["TYT Genel Deneme", "AYT Genel Deneme", "Türkiye Geneli Kurumsal Deneme", "Alan Denemesi (Sosyal/Fen/Mat)"] 
    }, 
    "LGS": { 
        "LGS Türkçe": ["Sözcükte Anlam", "Cümlede Anlam", "Paragrafta Anlam", "Fiilimsiler", "Cümlenin Ögeleri", "Cümle Türleri", "Yazım Kuralları", "Noktalama İşaretleri", "Anlatım Bozuklukları", "Metin Türleri ve Söz Sanatları", "Görsel Yorumlama ve Sözel Mantık"], 
        "LGS Matematik": ["Çarpanlar ve Katlar", "Üslü İfadeler", "Kareköklü İfadeler", "Veri Analizi", "Basit Olayların Olma Olasılığı", "Cebirsel İfadeler ve Özdeşlikler", "Doğrusal Denklemler", "Eşitsizlikler", "Üçgenler", "Eşlik ve Benzerlik", "Dönüşüm Geometrisi", "Geometrik Cisimler"], 
        "LGS Fen Bilimleri": ["Mevsimler ve İklim", "DNA ve Genetik Kod", "Basınç", "Madde ve Endüstri", "Basit Makineler", "Enerji Dönüşümleri ve Çevre Bilimi", "Elektrik Yükleri ve Elektrik Enerjisi"], 
        "LGS İnkılap Tarihi": ["Bir Kahraman Doğuyor", "Milli Uyanış: Bağımsızlık Yolunda Atılan Adımlar", "Milli Bir Destan: Ya İstiklal Ya Ölüm", "Atatürkçülük ve Çağdaşlaşan Türkiye", "Demokratikleşme Çabaları", "Atatürk Dönemi Türk Dış Politikası", "Atatürk'un Ölümü ve Sonrası"], 
        "LGS İngilizce": ["Friendship", "Teen Life", "In the Kitchen", "On the Phone", "The Internet", "Adventures", "Tourism", "Chores", "Science", "Natural Forces"], 
        "LGS Din Kültürü": ["Kader İnancı", "Zekat ve Sadaka", "Din ve Hayat", "Hz. Muhammed'in Örnekliliği", "Kur'an-ı Kerim ve Özellikleri"], 
        "Genel Deneme": ["LGS Genel Deneme", "Kurumsal Deneme", "Branş Denemesi"] 
    } 
};

const TEST_HAVUZU = {
    "Sınav Kaygısı Envanteri": [
        { q: "Sınav sırasında ellerim titrer ve terlerim.", puan: 5 },
        { q: "Sınav sonuçlarını düşünmekten ders çalışamıyorum.", puan: 5 },
        { q: "Sınav anında bildiğim her şeyi unutacakmış gibi hissediyorum.", puan: 5 },
        { q: "Deneme sınavlarında mideme kramplar giriyor.", puan: 5 },
        { q: "Çevremdekilerin benden beklentisi üzerimde büyük bir baskı oluşturuyor.", puan: 5 }
    ],
    "Motivasyon ve Odaklanma Testi": [
        { q: "Masa başına oturduğumda ilk 10 dakika dikkatim sürekli dağılıyor.", puan: 5 },
        { q: "Zorlandığım bir soruda hemen pes edip telefona bakıyorum.", puan: 5 },
        { q: "Haftalık hedeflerimi tamamladığımda kendimi ödüllendirmeyi unutuyorum.", puan: 5 },
        { q: "Neden ders çalıştığımı bazen tamamen unutmuş gibi hissediyorum.", puan: 5 }
    ],
    "Öğrenme Stili Belirleme": [
        { q: "Bir konuyu dinlerken grafikler ve tablolar görmek işimi kolaylaştırır.", puan: 5 },
        { q: "Anlatılanları birine sesli olarak tekrar ettiğimde daha iyi anlıyorum.", puan: 5 },
        { q: "Not çıkarırken sürekli kalemle oynamak veya yürümek istiyorum.", puan: 5 }
    ]
};

// ==========================================
// 3. SAYAÇ, DERS SEÇİMİ VE AFK DENETİMİ
// ==========================================

const sinavSecimi = document.getElementById('sinavSecimi'); 
const dersSecimiUI = document.getElementById('dersSecimiUI'); 
const konuSecimi = document.getElementById('konuSecimi');
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

let aktifDersString = localStorage.getItem(`${aktifOgrenci}_activeDers`);
if(!aktifDersString || !aktifDersString.includes('[')) {
    aktifDersString = "[YKS] TYT Matematik - Temel Kavramlar";
}

let tInterval;
let running = false;
let mode = 'normal';
let anlikXp = 0;
let oncekiGorevSayisi = -1; 
let sonZoomLinki = '';
let bekleyenDuelloRakip = '';

let yoklamaTimer;
let yoklamaGeriSayimInterval;

// 🔥 YENİ: EJDERHA (BOSS) SUNUCU SENKRONİZASYONU 🔥
let currentBossHp = 10000; 
const maxBossHp = 10000;
let ejderhaOluMu = false;

function updateBossUI() {
    const hpFill = document.getElementById('bossHpFill');
    const hpText = document.getElementById('bossHpText');
    
    if (!hpFill || !hpText) return;

    let percentage = (currentBossHp / maxBossHp) * 100;
    hpFill.style.width = percentage + "%";
    hpText.innerText = `${currentBossHp.toLocaleString()} / ${maxBossHp.toLocaleString()} HP`;

    if (percentage < 20) {
        hpFill.style.background = "linear-gradient(90deg, #7f1d1d, #ef4444)";
    } else {
        hpFill.style.background = "linear-gradient(90deg, #ef4444, #f97316)";
    }
}

function damageBoss(amount) {
    if (currentBossHp <= 0 || ejderhaOluMu) return; 
    socket.emit('boss_hasar_ver', { kocKodu: kocKodu, hasar: amount, ogrenciAd: aktifOgrenci });
}

function ejderhaGanimetiEkle() {
    const marketModal = document.querySelector('#marketModal .modal-content');
    if(!document.getElementById('ejderhaGanimeti')) {
        const ganimetHTML = `
        <div id="ejderhaGanimeti" class="market-item" style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 15px; border-radius: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; font-weight: 900; color: white; border: 2px solid #fbbf24; box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4); animation: pulse 2s infinite;">
            <span>🐉 Ejderha Tılsımı (Özel Görev Geçişi)</span>
            <button style="background: white; color: #ef4444; border: none; padding: 8px 12px; border-radius: 10px; font-weight: 900;" onclick="odulAl('Ejderha Tılsımı', 3000)">3000 XP</button>
        </div>`;
        const closeBtn = marketModal.querySelector('.close-modal-btn');
        closeBtn.insertAdjacentHTML('beforebegin', ganimetHTML);
    }
}

function pomodoroTamamlandiMekanikleri() {
    damageBoss(25);
}

function getDers() { 
    return `[${sinavSecimi.value}] ${dersSecimiUI.value} - ${konuSecimi.value}`; 
}

function mufredatYukle(ilkYukleme = false) { 
    const sinav = sinavSecimi.value; 
    dersSecimiUI.innerHTML = ''; 
    for(let d in MUFREDAT[sinav]) { 
        dersSecimiUI.innerHTML += `<option value="${d}">${d}</option>`; 
    } 
    if(!ilkYukleme) konuYukle(); 
}

function konuYukle(ilkYukleme = false) { 
    const sinav = sinavSecimi.value; 
    const ders = dersSecimiUI.value; 
    konuSecimi.innerHTML = ''; 
    
    if(MUFREDAT[sinav] && MUFREDAT[sinav][ders]) { 
        MUFREDAT[sinav][ders].forEach(k => { 
            konuSecimi.innerHTML += `<option value="${k}">${k}</option>`; 
        }); 
    } 
    
    if(!ilkYukleme) dersDegisikliginiKaydet(); 
}

function dersDegisikliginiKaydet() { 
    let yeniDers = getDers(); 
    if(yeniDers === aktifDersString) return; 
    
    if (running) { 
        let sessionElapsed = new Date().getTime() - parseInt(localStorage.getItem(`${aktifOgrenci}_startTime`));
        let oldSaved = parseInt(localStorage.getItem(`${aktifOgrenci}_${aktifDersString}_savedTime`)) || 0; 
        let diff = sessionElapsed + oldSaved; 
        
        localStorage.setItem(`${aktifOgrenci}_${aktifDersString}_savedTime`, diff); 
        socket.emit('istatistik_guncelle', { ogrenciAd: aktifOgrenci, ders: aktifDersString, ms: diff, kocKodu: kocKodu }); 
        
        socket.emit('aktivite_kaydet', {
            ogrenciAd: aktifOgrenci,
            kocKodu: kocKodu,
            ders: aktifDersString,
            sure: sessionElapsed,
            tip: mode === 'pomodoro' ? 'Pomodoro' : 'Normal Çalışma'
        });

        clearInterval(tInterval); 
        running = false; 
        localStorage.setItem(`${aktifOgrenci}_running`, 'false'); 
        
        pauseBtn.style.display = 'none'; 
        startBtn.style.display = 'block'; 
        startBtn.innerHTML = "▶ Başla"; 
        
        document.getElementById('statusText').innerHTML = "Ders değişti, sayaç durduruldu."; 
        document.getElementById('statusText').style.backgroundColor = "var(--bg-input)"; 
        document.getElementById('statusText').style.color = "var(--text-secondary)"; 
        
        socket.emit('ogrenci_derse_basladi', { ogrenciAd: aktifOgrenci, ders: aktifDersString, mesaj: 'Ders değiştirdi, durdurdu.', kocKodu: kocKodu }); 
        
        clearTimeout(yoklamaTimer);
    } 
    
    aktifDersString = yeniDers; 
    localStorage.setItem(`${aktifOgrenci}_activeDers`, aktifDersString); 
    localStorage.setItem(`${aktifOgrenci}_secilenSinav`, sinavSecimi.value); 
    localStorage.setItem(`${aktifOgrenci}_secilenDers`, dersSecimiUI.value); 
    localStorage.setItem(`${aktifOgrenci}_secilenKonu`, konuSecimi.value); 
    
    let currentSaved = parseInt(localStorage.getItem(`${aktifOgrenci}_${yeniDers}_savedTime`)) || 0; 
    gostergeyiGuncelle(currentSaved); 
    socket.emit('sure_guncelle', { ogrenciAd: aktifOgrenci, sure: display.innerHTML, kocKodu: kocKodu }); 
    
    if(currentSaved > 0 && mode === 'normal') { 
        startBtn.innerHTML = "▶ Devam Et"; 
    } else { 
        startBtn.innerHTML = "▶ Başla"; 
    } 
}

if(sinavSecimi) sinavSecimi.addEventListener('change', () => mufredatYukle(false)); 
if(dersSecimiUI) dersSecimiUI.addEventListener('change', () => konuYukle(false)); 
if(konuSecimi) konuSecimi.addEventListener('change', dersDegisikliginiKaydet);

function gostergeyiGuncelle(sureMs) { 
    if(mode === 'normal') { 
        let hours = Math.floor((sureMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((sureMs % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((sureMs % (1000 * 60)) / 1000); 
        
        display.innerHTML = (hours < 10 ? "0"+hours : hours) + ":" + 
                            (minutes < 10 ? "0"+minutes : minutes) + ":" + 
                            (seconds < 10 ? "0"+seconds : seconds); 
        return false; 
    } else { 
        let val = parseInt(document.getElementById('pomoInput').value) || 25;
        let kalan = (val * 60 * 1000) - sureMs; 
        
        if(kalan <= 0) { 
            display.innerHTML = "00:00"; 
            return true; 
        } 
        
        let minutes = Math.floor((kalan % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((kalan % (1000 * 60)) / 1000); 
        
        display.innerHTML = (minutes < 10 ? "0"+minutes : minutes) + ":" + 
                            (seconds < 10 ? "0"+seconds : seconds); 
        return false; 
    } 
}

function sesCal() { 
    const s = document.getElementById('bildirimSesi'); 
    if(s) { s.currentTime = 0; s.play().catch(e=>{}); }
}

function rastgeleYoklamaKur() {
    clearTimeout(yoklamaTimer);
    let rastgeleDakika = Math.floor(Math.random() * (25 - 15 + 1)) + 15;
    let beklemeSuresi = rastgeleDakika * 60 * 1000;
    
    yoklamaTimer = setTimeout(yoklamayiTetikle, beklemeSuresi);
}

function yoklamayiTetikle() {
    sesCal();
    sistemBildirimi("🚨 Gözüm Üzerinde Kaptan!", "60 saniye içinde burada olduğunu onayla, yoksa odaklanman iptal edilecek!");
    
    let modal = document.getElementById('yoklamaModal');
    if(modal) {
        modal.style.display = 'flex';
        let sayacEl = document.getElementById('yoklamaGeriSayim');
        let kalanSaniye = 60;
        sayacEl.innerText = kalanSaniye;

        yoklamaGeriSayimInterval = setInterval(() => {
            kalanSaniye--;
            sayacEl.innerText = kalanSaniye;
            
            if(kalanSaniye <= 0) {
                clearInterval(yoklamaGeriSayimInterval);
                modal.style.display = 'none';
                
                window.pauseTimer(false); 
                document.getElementById('statusText').innerHTML = "🚨 Masadan ayrıldığın için odaklanma durduruldu!";
                document.getElementById('statusText').style.backgroundColor = "#fee2e2";
                document.getElementById('statusText').style.color = "#dc2626";
                
                socket.emit('masa_basi_uyarisi', { ogrenciAd: aktifOgrenci, kocKodu: kocKodu });
            }
        }, 1000);
    }
}

window.yoklamaBuradayim = function() {
    clearInterval(yoklamaGeriSayimInterval);
    let modal = document.getElementById('yoklamaModal');
    if(modal) modal.style.display = 'none';
    rastgeleYoklamaKur();
};

// ==========================================
// 4. WINDOW'A BAĞLI (ONCLICK) FONKSİYONLAR
// ==========================================

window.setMode = function(m) { 
    if(running) return; 
    
    mode = m; 
    localStorage.setItem(`${aktifOgrenci}_mode`, m); 
    
    let mNormal = document.getElementById('modeNormal');
    let mPomo = document.getElementById('modePomo');
    
    if(mNormal && mPomo) {
        mNormal.className = m === 'normal' ? 'mode-btn mode-active' : 'mode-btn mode-passive'; 
        mPomo.className = m === 'pomodoro' ? 'mode-btn mode-active' : 'mode-btn mode-passive'; 
    }
    
    let pInput = document.getElementById('pomoInput');
    if(pInput) {
        pInput.style.display = m === 'pomodoro' ? 'block' : 'none'; 
    }

    if (m === 'pomodoro') {
        let val = parseInt(document.getElementById('pomoInput').value) || 25;
        display.innerHTML = (val < 10 ? "0"+val : val) + ":00";
        startBtn.innerHTML = "▶ Başla";
    } else {
        let gercekDers = getDers();
        let sTime = parseInt(localStorage.getItem(`${aktifOgrenci}_${gercekDers}_savedTime`)) || 0;
        gostergeyiGuncelle(sTime);
        if(sTime > 0) startBtn.innerHTML = "▶ Devam Et";
        else startBtn.innerHTML = "▶ Başla";
    }
};

window.startTimer = function() { 
    if (!running) { 
        let gercekDers = getDers();

        localStorage.setItem(`${aktifOgrenci}_startTime`, new Date().getTime()); 
        localStorage.setItem(`${aktifOgrenci}_running`, 'true'); 
        
        tInterval = setInterval(() => { 
            let sessionElapsed = new Date().getTime() - parseInt(localStorage.getItem(`${aktifOgrenci}_startTime`));
            let totalDiff = sessionElapsed + (parseInt(localStorage.getItem(`${aktifOgrenci}_${gercekDers}_savedTime`)) || 0); 
            
            let bittiMi = false;
            if (mode === 'pomodoro') {
                bittiMi = gostergeyiGuncelle(sessionElapsed); 
            } else {
                bittiMi = gostergeyiGuncelle(totalDiff); 
            }
            
            if (bittiMi && mode === 'pomodoro') { 
                sesCal(); 
                window.pauseTimer(true); 
                sistemBildirimi("🍅 Pomodoro Bitti!", "Harika odaklandın, şimdi mola vakti."); 
                
                if(typeof pomodoroTamamlandiMekanikleri === 'function') {
                    pomodoroTamamlandiMekanikleri();
                }
            } 
            
            socket.emit('sure_guncelle', { ogrenciAd: aktifOgrenci, sure: display.innerHTML, kocKodu: kocKodu }); 
        }, 1000); 
        
        running = true; 
        startBtn.style.display = 'none'; 
        pauseBtn.style.display = 'block'; 
        
        document.getElementById('statusText').innerHTML = "🟢 Odak modu aktif!"; 
        document.getElementById('statusText').style.backgroundColor = "rgba(16, 185, 129, 0.1)"; 
        document.getElementById('statusText').style.color = "#10b981"; 
        
        socket.emit('ogrenci_derse_basladi', { 
            ogrenciAd: aktifOgrenci, 
            ders: gercekDers, 
            mesaj: mode === 'pomodoro' ? 'Pomodoro Başlattı!' : 'Kronometre Başlattı!', 
            kocKodu: kocKodu 
        }); 
        
        rastgeleYoklamaKur();
    } 
};

window.pauseTimer = function(otomatikMi = false) { 
    if (running) { 
        let gercekDers = getDers();

        clearInterval(tInterval); 
        
        let sessionElapsed = new Date().getTime() - parseInt(localStorage.getItem(`${aktifOgrenci}_startTime`));
        let diff = sessionElapsed + (parseInt(localStorage.getItem(`${aktifOgrenci}_${gercekDers}_savedTime`)) || 0);
        
        localStorage.setItem(`${aktifOgrenci}_${gercekDers}_savedTime`, otomatikMi && mode === 'pomodoro' ? 0 : diff); 
        
        socket.emit('istatistik_guncelle', { ogrenciAd: aktifOgrenci, ders: gercekDers, ms: diff, kocKodu: kocKodu }); 

        socket.emit('aktivite_kaydet', {
            ogrenciAd: aktifOgrenci,
            kocKodu: kocKodu,
            ders: gercekDers,
            sure: sessionElapsed, 
            tip: mode === 'pomodoro' ? 'Pomodoro' : 'Normal Çalışma'
        });
        
        localStorage.setItem(`${aktifOgrenci}_running`, 'false'); 
        running = false; 
        pauseBtn.style.display = 'none'; 
        startBtn.style.display = 'block'; 
        startBtn.innerHTML = otomatikMi ? "▶ Başla" : "▶ Devam Et"; 
        
        if(document.getElementById('statusText').innerHTML !== "🚨 Masadan ayrıldığın için odaklanma durduruldu!") {
            document.getElementById('statusText').innerHTML = otomatikMi ? "🎉 Pomodoro Bitti!" : "⏸️ Mola Verildi."; 
            document.getElementById('statusText').style.backgroundColor = "rgba(245, 158, 11, 0.1)"; 
            document.getElementById('statusText').style.color = "#f59e0b"; 
        }
        
        socket.emit('ogrenci_derse_basladi', { 
            ogrenciAd: aktifOgrenci, 
            ders: gercekDers, 
            mesaj: otomatikMi ? 'Pomodoro Bitti, Molada.' : 'Mola verdi, durdurdu.', 
            kocKodu: kocKodu 
        }); 
        
        clearTimeout(yoklamaTimer);
        clearInterval(yoklamaGeriSayimInterval);
        let modal = document.getElementById('yoklamaModal');
        if(modal) modal.style.display = 'none';

        if (otomatikMi && mode === 'pomodoro') {
            let val = parseInt(document.getElementById('pomoInput').value) || 25;
            display.innerHTML = (val < 10 ? "0"+val : val) + ":00";
        }
    } 
};

window.planEkle = function() {
    let input = document.getElementById('yeniPlanInput');
    if(input && input.value.trim() !== '') {
        socket.emit('calisma_plani_ekle', {
            ogrenciAd: aktifOgrenci,
            kocKodu: kocKodu,
            planMetni: input.value.trim()
        });
        input.value = '';
    }
};

window.planTamamla = function(id, currentStatus) {
    if(!currentStatus) sesCal(); 
    socket.emit('calisma_plani_tamamla', {
        ogrenciAd: aktifOgrenci,
        kocKodu: kocKodu,
        planId: id,
        tamamlandi: !currentStatus
    });
};

window.planSil = function(id) {
    if(confirm("Bu planı silmek istediğine emin misin?")) {
        socket.emit('calisma_plani_sil', {
            ogrenciAd: aktifOgrenci,
            kocKodu: kocKodu,
            planId: id
        });
    }
};

window.aktiviteGoster = function() {
    let kutu = document.getElementById('aktiviteListesi');
    if(kutu) {
        kutu.innerHTML = '';
        if(!benimAktiviteGecmisim || benimAktiviteGecmisim.length === 0) {
            kutu.innerHTML = '<div style="padding:20px; color:var(--text-secondary); font-weight:800; text-align:center;">Henüz kaydedilmiş bir kronometre/pomodoro geçmişin yok.</div>';
        } else {
            benimAktiviteGecmisim.forEach(a => {
                let sureMetni = msToTime(a.sureMs);
                let tipRengi = a.tip === 'Pomodoro' ? '#ef4444' : '#3b82f6';
                kutu.innerHTML += `
                <div style="background:var(--bg-input); padding:15px; border-radius:15px; border:2px solid var(--border-light); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-size:12px; color:var(--text-secondary); font-weight:800;">${a.tarih} - ${a.saat}</div>
                        <div style="font-weight:900; color:var(--text-primary); font-size:14px; margin-top:5px;">${a.ders}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:#10b981; font-weight:900; font-size:15px;">${sureMetni}</div>
                        <div style="font-size:11px; background:${tipRengi}20; color:${tipRengi}; padding:4px 8px; border-radius:8px; font-weight:900; display:inline-block; margin-top:5px;">${a.tip}</div>
                    </div>
                </div>`;
            });
        }
    }
    document.getElementById('aktiviteModal').style.display = 'flex';
};

window.radyoKapat = function() { 
    if(document.getElementById('radyoLofi')) document.getElementById('radyoLofi').pause(); 
    if(document.getElementById('radyoYagmur')) document.getElementById('radyoYagmur').pause(); 
    if(document.getElementById('radyoKafe')) document.getElementById('radyoKafe').pause(); 
    document.querySelectorAll('.radyo-btn').forEach(b => b.classList.remove('aktif')); 
};

window.radyoCal = function(tur) { 
    window.radyoKapat(); 
    let btn = document.getElementById('btn' + tur);
    if(btn) btn.classList.add('aktif'); 
    let audio = document.getElementById('radyo' + tur); 
    if(audio) { audio.volume = 0.5; audio.play().catch(e=>{}); }
};

window.hataResmiSec = function(input) {
    if(input.files && input.files[0]) {
        resimSikistir(input.files[0], function(kucukResim) {
            let suAnkiDers = getDers();
            socket.emit('hata_sorusu_ekle', { 
                ogrenciAd: aktifOgrenci, 
                kocKodu: kocKodu, 
                resim: kucukResim, 
                dersKonu: suAnkiDers 
            }); 
            alert("Soru başarıyla Hata Defterine eklendi! Koçunuz bunu görecek.");
            input.value = ''; 
        });
    }
};

window.duelloAt = function(hedefIsim) { 
    if(hedefIsim === aktifOgrenci) return alert("Kendine meydan okuyamazsın!"); 
    if(confirm(`${hedefIsim} isimli arkadaşına meydan okumak istiyor musun?`)) { 
        socket.emit('duello_teklif_et', { gonderen: aktifOgrenci, hedef: hedefIsim, miktar: 50, kocKodu: kocKodu }); 
        document.getElementById('duelloModal').style.display = 'none'; 
    } 
};

window.duelloKabulEt = function() { 
    socket.emit('duello_kabul_edildi', { gonderen: bekleyenDuelloRakip, hedef: aktifOgrenci, miktar: 50, kocKodu: kocKodu }); 
    document.getElementById('duelloIstekModal').style.display = 'none'; 
};

window.avatarSec = function(ikon) { 
    document.getElementById('aktifAvatar').innerHTML = ikon; 
    document.getElementById('avatarModal').style.display = 'none'; 
    socket.emit('avatar_guncelle', { ogrenciAd: aktifOgrenci, avatar: ikon, kocKodu: kocKodu }); 
};

window.netKaydet = function() { 
    let tur = document.getElementById('sinavTuru').value; 
    let detayKutusu = document.getElementById('detayliNetKutusu');
    let toplamNet = 0;
    let detayliObj = null;

    if(detayKutusu && detayKutusu.style.display !== 'none') {
        let turkce = Number(document.getElementById('netTurkce').value) || 0;
        let mat = Number(document.getElementById('netMatematik').value) || 0;
        let fen = Number(document.getElementById('netFen').value) || 0;
        let sos = Number(document.getElementById('netSosyal').value) || 0;
        
        toplamNet = turkce + mat + fen + sos;
        detayliObj = {
            "Türkçe": turkce,
            "Matematik": mat,
            "Fen Bilimleri": fen,
            "Sosyal Bilimler": sos
        };
    } else {
        let net = document.getElementById('netSkoru').value; 
        if(!net) return alert("Net girmelisiniz!");
        toplamNet = Number(net);
    }
    
    socket.emit('net_ekle', { 
        ogrenciAd: aktifOgrenci, 
        sinavTuru: tur, 
        netSkoru: toplamNet, 
        detay: detayliObj,
        kocKodu: kocKodu 
    }); 
    
    if(document.getElementById('netSkoru')) document.getElementById('netSkoru').value = ''; 
    document.getElementById('netModal').style.display = 'none'; 
    alert("Netiniz iletildi! Koçunuz zayıf konuları analiz edecek. 🚀"); 
};

window.testiYukle = function() {
    const secilenTest = document.getElementById('testSecici').value;
    const soruAlani = document.getElementById('dinamikSoruAlani');
    const gonderBtn = document.getElementById('testGonderBtn');
    
    if(!secilenTest) {
        soruAlani.style.display = 'none';
        gonderBtn.style.display = 'none';
        return;
    }

    const sorular = TEST_HAVUZU[secilenTest];
    soruAlani.innerHTML = '';
    soruAlani.style.display = 'block';
    gonderBtn.style.display = 'block';

    sorular.forEach((s, index) => {
        soruAlani.innerHTML += `
            <div style="margin-bottom: 20px; background: var(--bg-input); padding: 15px; border-radius: 15px; border: 1px solid var(--border-light);">
                <label style="font-weight: 800; color: var(--text-primary); font-size: 14px; display:block; margin-bottom:10px;">${index+1}. ${s.q}</label>
                <select class="anket-cevap select-box" data-puan="${s.puan}" style="width:100%; margin:0;">
                    <option value="1">Hiç Katılmıyorum (1 Puan)</option>
                    <option value="2">Az Katılıyorum (2 Puan)</option>
                    <option value="3">Kararsızım (3 Puan)</option>
                    <option value="4">Çok Katılıyorum (4 Puan)</option>
                    <option value="5">Tamamen Katılıyorum (5 Puan)</option>
                </select>
            </div>
        `;
    });
};

window.psikolojikTestKaydet = function() {
    const testAdi = document.getElementById('testSecici').value;
    const cevaplar = document.querySelectorAll('.anket-cevap');
    let toplamSkor = 0;
    let maxSkor = cevaplar.length * 5;

    cevaplar.forEach(c => {
        toplamSkor += parseInt(c.value);
    });

    let yuzde = (toplamSkor / maxSkor) * 100;
    let sonucYorum = "";

    if (testAdi === "Sınav Kaygısı Envanteri") {
        sonucYorum = yuzde > 70 ? "Kritik Kaygı Seviyesi" : yuzde > 40 ? "Orta Derece Stres" : "Sağlıklı Kaygı Seviyesi";
    } else if (testAdi === "Motivasyon ve Odaklanma Testi") {
        sonucYorum = yuzde > 70 ? "Yüksek Motivasyon" : yuzde > 40 ? "Dengeli Odaklanma" : "Acil Destek Gerekli";
    } else {
        sonucYorum = "Öğrenme Stili Testi Tamamlandı";
    }

    socket.emit('rehberlik_testi_kaydet', {
        ogrenciAd: aktifOgrenci,
        kocKodu: kocKodu,
        testAdi: testAdi,
        skor: toplamSkor,
        sonuc: sonucYorum
    });

    document.getElementById('rehberlikModal').style.display = 'none';
    alert(`Teşekkürler ${aktifOgrenci}! Analiz raporun koçuna "Özel Rapor" olarak iletildi. 🚀`);
};

window.odulAl = function(odulIsmi, bedel) { 
    if(anlikXp < bedel) return alert("Yetersiz XP!"); 
    if(confirm(`${odulIsmi} almak istiyor musun?`)) { 
        socket.emit('odul_satin_al', { ogrenciAd: aktifOgrenci, odul: odulIsmi, bedel: bedel, kocKodu: kocKodu }); 
        document.getElementById('marketModal').style.display = 'none'; 
        
        if(odulIsmi.includes('Ejderha')) {
            localStorage.setItem(`${aktifOgrenci}_ejderhaAvcisi`, 'true');
            rozetleriKontrolEt();
        }
    } 
};

window.goreviBitir = function(id) { 
    sesCal(); 
    socket.emit('gorev_tamamlandi', { ogrenciAd: aktifOgrenci, gorevId: id, durum: true, kocKodu: kocKodu }); 
};

// 🚀 ZİNCİR GÖREV ADIMINI BİTİRME
window.zincirAdimBitir = function(id, index) {
    sesCal();
    socket.emit('zincir_adim_tamamla', { ogrenciAd: aktifOgrenci, gorevId: id, adimIndex: index, kocKodu: kocKodu });
};

window.kaynakBitir = function(id, baslik) {
    if(confirm(`"${baslik}" kaynağını gerçekten bitirdin mi? Koçuna bildirim gidecek!`)) {
        sesCal();
        socket.emit('kaynak_cozuldu', { 
            ogrenciAd: aktifOgrenci, 
            kocKodu: kocKodu, 
            kaynakId: id, 
            kaynakBaslik: baslik 
        });
        alert("Süpersin! +5 XP hesabına eklendi.");
    }
};

window.toggleChat = function() { 
    const body = document.getElementById('chatBody');
    const footer = document.getElementById('chatFooter');
    const uyari = document.getElementById('chatUyari'); 
    
    if(body.style.display === 'flex') { 
        body.style.display = 'none'; 
        footer.style.display = 'none'; 
    } else { 
        body.style.display = 'flex'; 
        footer.style.display = 'flex'; 
        if(uyari) uyari.style.display = 'none'; 
        body.scrollTop = body.scrollHeight; 
    } 
};

window.mesajGonder = function() { 
    const input = document.getElementById('chatInput'); 
    if(input.value.trim() !== '') { 
        socket.emit('chat_mesaji_gonder', { gonderen: aktifOgrenci, mesaj: input.value, rol: 'ogrenci', kocKodu: kocKodu }); 
        input.value = ''; 
    } 
};

window.resimGonder = function(input) { 
    if(input.files && input.files[0]) { 
        resimSikistir(input.files[0], function(kucukResim) {
            socket.emit('chat_mesaji_gonder', { 
                gonderen: aktifOgrenci, 
                mesaj: kucukResim, 
                rol: 'ogrenci', 
                tip: 'resim', 
                kocKodu: kocKodu 
            }); 
            input.value = ''; 
        });
    } 
};

window.toggleBot = function() { 
    const body = document.getElementById('botBody');
    const footer = document.getElementById('botFooter'); 
    
    if(body.style.display === 'flex') { 
        body.style.display = 'none'; 
        footer.style.display = 'none'; 
    } else { 
        body.style.display = 'flex'; 
        footer.style.display = 'flex'; 
        body.scrollTop = body.scrollHeight; 
    } 
};

window.botMesajGonder = function() { 
    const input = document.getElementById('botInput'); 
    let mesajMetni = input.value.trim(); 
    
    if(mesajMetni !== '') { 
        const body = document.getElementById('botBody'); 
        body.innerHTML += `<div style="align-self: flex-end; background: #a855f7; color: white; padding: 10px 14px; border-radius: 14px; font-size: 13px; max-width: 80%; line-height: 1.4; margin-bottom: 10px; font-weight: 700;">${mesajMetni}</div>`; 
        body.scrollTop = body.scrollHeight; 
        
        let suAnkiDers = getDers();
        socket.emit('ogrenci_chatbot_mesaji', { ogrenciAd: aktifOgrenci, mesaj: mesajMetni, ders: suAnkiDers, kocKodu: kocKodu }); 
        input.value = ''; 
    } 
};

// ==========================================
// 5. SOCKET.IO DİNLEYİCİLERİ
// ==========================================

socket.on('boss_guncellendi', (veri) => {
    currentBossHp = veri.hp;
    updateBossUI();

    if (currentBossHp <= 0 && !ejderhaOluMu) {
        ejderhaOluMu = true;
        sistemBildirimi("🐉 Ejderha Devrildi!", `${veri.sonVuran} son darbeyi indirdi!`);
        alert(`🏆 TEBRİKLER! ${veri.sonVuran} son darbeyi indirdi ve Ejderha devrildi! Marketten ganimetini alabilirsin.`);
        localStorage.setItem(`${aktifOgrenci}_ejderhaAvcisi`, 'true');
        ejderhaGanimetiEkle();
        rozetleriKontrolEt();
    }
});

socket.on('gorev_guncellendi', (tumVeriler) => {
    let duelloDiv = document.getElementById('duelloSinifListesi'); 
    if(duelloDiv){ 
        duelloDiv.innerHTML = ''; 
        tumVeriler.forEach(o => { 
            if(o.ogrenciAd !== aktifOgrenci) { 
                duelloDiv.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--border-light);">
                    <span>${o.avatar || '👤'} <b>${o.ogrenciAd}</b></span> 
                    <button class="duel-btn" style="background:#ef4444; color:white; border:none; padding:6px 10px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="duelloAt('${o.ogrenciAd}')">Meydan Oku</button>
                </div>`; 
            } 
        }); 
    }

    let benimVerim = tumVeriler.find(v => v.ogrenciAd === aktifOgrenci);
    if (benimVerim) {
        
        benimTamamlananKaynaklar = benimVerim.tamamlananKaynaklar || [];
        benimAktiviteGecmisim = benimVerim.aktiviteGecmisi || [];

        rozetleriKontrolEt();

        if (benimVerim.sonrakiDers && benimVerim.sonrakiDers.trim() !== '') {
            let d = new Date(benimVerim.sonrakiDers);
            let tarihStr = d.toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

            if(document.getElementById('randevuTarihi')) document.getElementById('randevuTarihi').innerText = tarihStr;
            if(document.getElementById('randevuKonusu')) document.getElementById('randevuKonusu').innerText = benimVerim.gorusmeKonusu || "Birebir Görüşme";
            
            let kutu = document.getElementById('randevuKutusu');
            if(kutu) kutu.style.display = 'block';
        } else {
            let kutu = document.getElementById('randevuKutusu');
            if(kutu) kutu.style.display = 'none';
        }

        if (benimVerim.canliDersLink && benimVerim.canliDersLink.trim() !== '') {
            let zBtn = document.getElementById('zoomLinkBtn');
            if(zBtn) {
                zBtn.href = benimVerim.canliDersLink;
                zBtn.style.display = 'block';
                if(sonZoomLinki !== benimVerim.canliDersLink) {
                    sistemBildirimi("🔴 Canlı Ders Başladı!", "Koçun yayında, panele gir ve derse katıl!");
                    sonZoomLinki = benimVerim.canliDersLink;
                }
            }
        } else { 
            if(document.getElementById('zoomLinkBtn')) {
                document.getElementById('zoomLinkBtn').style.display = 'none'; 
            }
        }

        if (benimVerim.hataDefteri) {
            let hataKutu = document.getElementById('hataListem');
            if(hataKutu) {
                hataKutu.innerHTML = '';
                
                let normalHataHtml = '';
                let tekrarHataHtml = '';

                benimVerim.hataDefteri.forEach(hata => {
                    let gunFarki = gunFarkiHesapla(hata.tarih);
                    let tekrarZamaniGeldiMi = false;
                    
                    if (hata.durum === 'Çözüldü') {
                        if (gunFarki === 3 || gunFarki === 7 || gunFarki >= 30) {
                            tekrarZamaniGeldiMi = true;
                        }
                    }

                    if (tekrarZamaniGeldiMi) {
                        tekrarHataHtml += `
                        <div style="border: 2px dashed #ec4899; padding: 15px; margin-bottom: 15px; border-radius: 12px; background: rgba(236, 72, 153, 0.05);">
                            <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                                <span style="background:#ec4899; color:white; padding:4px 8px; border-radius:6px; font-weight:900; font-size:11px;">🧠 TEKRAR ZAMANI</span> 
                                <span style="font-size:11px; color:var(--text-secondary); font-weight:800;">${gunFarki} Gün Önce Çözüldü</span>
                            </div>
                            <b style="color:var(--text-primary); font-size: 13px;">${hata.dersKonu}</b>
                            <br><img src="${hata.resim}" style="max-width:100%; max-height:150px; margin-top:10px; border-radius:8px; border:1px solid var(--border-light); cursor:pointer;" onclick="window.open('${hata.resim}','_blank')">
                        </div>`;
                    } else if (hata.durum === 'Bekliyor') {
                        normalHataHtml += `
                        <div style="border-bottom: 2px solid var(--border-light); padding-bottom: 15px; margin-bottom: 15px;">
                            <span style="background:#f59e0b; color:white; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:11px;">Bekliyor</span> 
                            <b style="color:var(--text-primary); margin-left:5px; font-size:13px;">${hata.dersKonu}</b> <br>
                            <span style="font-size:11px; color:var(--text-secondary);">Yüklenme: ${hata.tarih}</span>
                            <br><img src="${hata.resim}" style="max-width:100%; max-height:150px; margin-top:10px; border-radius:8px; border:1px solid var(--border-light); cursor:pointer;" onclick="window.open('${hata.resim}','_blank')">
                        </div>`;
                    }
                });

                if (tekrarHataHtml !== '') {
                    hataKutu.innerHTML += `<div style="font-size:12px; font-weight:900; color:#ec4899; margin-bottom:10px; letter-spacing:0.5px;">🔥 UNUTMA EĞRİSİ: TEKRAR ÇÖZ!</div>${tekrarHataHtml}`;
                }
                if (normalHataHtml !== '') {
                    hataKutu.innerHTML += `<div style="font-size:12px; font-weight:900; color:var(--text-secondary); margin-bottom:10px; margin-top:15px; letter-spacing:0.5px;">⏳ KOÇUN CEVABINI BEKLEYENLER</div>${normalHataHtml}`;
                }

                if (hataKutu.innerHTML === '') {
                    hataKutu.innerHTML = '<span style="color:var(--text-secondary); font-weight:bold; font-size:14px;">Hata defterin tertemiz. Süpersin! 🎉</span>';
                }
            }
        }

        if (benimVerim.gorevler) { 
            if (oncekiGorevSayisi !== -1 && benimVerim.gorevler.length > oncekiGorevSayisi) { 
                sesCal(); 
                sistemBildirimi("🎯 Yeni Görev Atandı!", "Koçun sana yeni bir hedef belirledi. Hemen paneline bak!"); 
            } 
            oncekiGorevSayisi = benimVerim.gorevler.length; 
        }

        if(benimVerim.veliKodu && document.getElementById('veliKoduGosterge')) { 
            document.getElementById('veliKoduGosterge').innerText = benimVerim.veliKodu; 
            localStorage.setItem('veliKodu', benimVerim.veliKodu); 
        }
        
        anlikXp = benimVerim.xp || 0; 
        if(document.getElementById('marketXpDisplay')) {
            document.getElementById('marketXpDisplay').innerText = anlikXp + " XP";
        }
        if(benimVerim.avatar && document.getElementById('aktifAvatar')) {
            document.getElementById('aktifAvatar').innerHTML = benimVerim.avatar;
        }
        
        let xpBadge = document.getElementById('xpBadge'); 
        if (!xpBadge) { 
            xpBadge = document.createElement('div'); 
            xpBadge.id = 'xpBadge'; 
            xpBadge.style.cssText = "position:absolute; top:20px; left:20px; color:white; padding:8px 15px; border-radius:20px; font-weight:800; font-size:14px; box-shadow:0 4px 10px rgba(0,0,0,0.2); z-index:100;"; 
            document.body.appendChild(xpBadge); 
        }
        
        let sirali = tumVeriler.sort((a,b) => (b.xp||0) - (a.xp||0));
        let benimSira = sirali.findIndex(v => v.ogrenciAd === aktifOgrenci);
        let ligIsmi = 'Henüz Lige Giremedi', ligRengi = '#94a3b8', anaRenk = '#64748b';
        
        if(benimSira !== -1 && benimVerim.xp > 0) { 
            if(benimSira < 3) { ligIsmi = '🏆 Süper Lig'; ligRengi = '#fef3c7'; anaRenk = '#f59e0b'; } 
            else if(benimSira < 8) { ligIsmi = '🥇 1. Lig'; ligRengi = '#f1f5f9'; anaRenk = '#64748b'; } 
            else { ligIsmi = '🪵 Amatör Lig'; ligRengi = '#ffedd5'; anaRenk = '#d97706'; } 
        }
        
        let seriGunu = localStorage.getItem(`${aktifOgrenci}_seriGunu`) || 1;
        let rozetIcerik = `<span style="background:${ligRengi}; color:${anaRenk}; padding:4px 8px; border-radius:10px; margin-right:6px;">${ligIsmi}</span> | ${anlikXp} XP | 🔥 ${seriGunu} Gün`;
        
        if(benimVerim.aktifDuello && benimVerim.aktifDuello.rakip) { 
            rozetIcerik += `<div style="background:#ef4444; color:white; padding:4px; border-radius:6px; margin-top:5px; font-size:11px; text-align:center;">⚔️ ${benimVerim.aktifDuello.rakip} ile Düelloda!</div>`; 
        }
        xpBadge.style.background = anaRenk; 
        xpBadge.innerHTML = rozetIcerik;

        let tb = document.getElementById('taskBoard');
        let taskList = document.getElementById('studentTaskList');
        if (benimVerim.gorevler && benimVerim.gorevler.length > 0) { 
            if(tb) tb.style.display = 'block'; 
            if(taskList) { 
                taskList.innerHTML = ''; 
                benimVerim.gorevler.forEach(gorev => { 
                    
                    // 🔗 ZİNCİR GÖREV EKRANA BASMA (YENİ)
                    if (gorev.isZincir) {
                        let zincirHTML = `<div style="background: rgba(59, 130, 246, 0.05); border: 2px dashed #3b82f6; border-radius: 15px; padding: 15px; margin-bottom: 12px;">`;
                        zincirHTML += `<div style="font-weight: 900; color: #3b82f6; margin-bottom: 10px; font-size: 14px;">🔗 ZİNCİR GÖREV HATTI</div>`;

                        let unlockNext = true; 
                        gorev.altAdimlar.forEach((adim, index) => {
                            let isCompleted = adim.tamamlandi;
                            let isLocked = !unlockNext && !isCompleted;

                            let icon = isCompleted ? "✅" : (isLocked ? "🔒" : "🟢");
                            let textStyle = isCompleted ? "text-decoration: line-through; color: var(--text-secondary);" : (isLocked ? "color: var(--text-secondary); opacity: 0.5;" : "color: var(--text-primary); font-weight: 800;");
                            let btnHTML = '';

                            if (!isCompleted && !isLocked) {
                                btnHTML = `<button style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer;" onclick="zincirAdimBitir(${gorev.id}, ${index})">Geç</button>`;
                                unlockNext = false; 
                            } else if (isCompleted) {
                                unlockNext = true; 
                            } else {
                                unlockNext = false;
                            }

                            zincirHTML += `
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 8px; background: var(--bg-container); border-radius: 10px; border: 1px solid var(--border-light);">
                                <span style="${textStyle}; font-size: 13px; flex: 1;">${icon} ${adim.metin}</span>
                                ${btnHTML}
                            </div>`;
                        });

                        if (gorev.tamamlandi) {
                            zincirHTML += `<div style="text-align:center; color: #10b981; font-weight: 900; margin-top: 10px; font-size: 12px;">🎉 Zincir Tamamlandı! (+25 XP)</div>`;
                        }
                        zincirHTML += `</div>`;
                        taskList.innerHTML += zincirHTML;
                    } 
                    // NORMAL GÖREV EKRANA BASMA
                    else {
                        let textStil = gorev.tamamlandi ? "text-decoration: line-through; color: var(--text-secondary);" : "color: var(--text-primary); font-weight: 800;"; 
                        let sagKisim = gorev.tamamlandi ? `<span style="color: #10b981; font-weight: 800;">✅ Bitti</span>` : `<button class="finish-btn" onclick="goreviBitir(${gorev.id})">Bitir (+10 XP)</button>`; 
                        taskList.innerHTML += `<div class="task-item"><span style="${textStil}">${gorev.metin}</span>${sagKisim}</div>`; 
                    }
                }); 
            } 
        } else {
            if(tb) tb.style.display = 'none';
        }

        let planList = document.getElementById('calismaPlaniListesi');
        if (planList) {
            planList.innerHTML = '';
            if (benimVerim.calismaProgrami && benimVerim.calismaProgrami.length > 0) {
                benimVerim.calismaProgrami.forEach(p => {
                    let textStil = p.tamamlandi ? "text-decoration: line-through; color: #10b981; font-weight:900;" : "color: var(--text-primary); font-weight: 800;";
                    let icon = p.tamamlandi ? "✅" : "⏳";
                    let bg = p.tamamlandi ? "background: rgba(16, 185, 129, 0.1); border-color: #10b981;" : "background: var(--bg-input); border-color: var(--border-light);";
                    
                    planList.innerHTML += `
                    <div style="${bg} padding: 12px 15px; border-radius: 15px; border-width: 2px; border-style: solid; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; transition: 0.3s;">
                        <div style="cursor:pointer; display:flex; align-items:center; gap:10px; flex:1;" onclick="planTamamla(${p.id}, ${p.tamamlandi})">
                            <span style="font-size:18px;">${icon}</span>
                            <span style="${textStil}">${p.metin}</span>
                        </div>
                        <button onclick="planSil(${p.id})" style="background:transparent; border:none; color:#ef4444; font-size:16px; cursor:pointer;" title="Sil">🗑️</button>
                    </div>`;
                });
            } else {
                planList.innerHTML = '<div style="color: var(--text-secondary); font-style: italic; text-align:center; padding: 10px;">Henüz bir plan eklenmemiş.</div>';
            }
        }
    }
});

socket.on('eski_verileri_yukle', (tumVeriler) => {
    let benimVerim = tumVeriler.find(v => v.ogrenciAd === aktifOgrenci);
    if(benimVerim) {
        benimTamamlananKaynaklar = benimVerim.tamamlananKaynaklar || [];
        benimAktiviteGecmisim = benimVerim.aktiviteGecmisi || [];
        rozetleriKontrolEt();
    }
});

socket.on('duello_istegi_geldi', (veri) => { 
    if(veri.hedef === aktifOgrenci) { 
        bekleyenDuelloRakip = veri.gonderen; 
        document.getElementById('duelloIstekMetni').innerText = `${veri.gonderen} sana 50 XP'sine meydan okuyor!`; 
        document.getElementById('duelloIstekModal').style.display = 'flex'; 
        sesCal(); 
        sistemBildirimi("⚔️ Meydan Okuma!", `${veri.gonderen} sana düello teklif etti!`); 
    } 
});

socket.on('duello_basladi', (veri) => { 
    if(veri.o1 === aktifOgrenci || veri.o2 === aktifOgrenci) { 
        alert("⚔️ DÜELLO BAŞLADI!"); 
        sesCal(); 
    } 
});

socket.on('duello_sonucu', (veri) => { 
    if(veri.kazanan === aktifOgrenci) { 
        alert(`🏆 Kazandın! +${veri.miktar} XP`); 
        sesCal(); 
        sistemBildirimi("🏆 Düelloyu Kazandın!", `Tebrikler, ${veri.miktar} XP hesaba eklendi.`);
    } else if(veri.kaybeden === aktifOgrenci) { 
        alert(`💀 Kaybettin! -${veri.miktar} XP`); 
        sistemBildirimi("💀 Düelloyu Kaybettin", `${veri.kazanan} senden önce bitirdi.`);
    } 
});

socket.on('kaynaklari_yukle', (liste) => { 
    let kutu = document.getElementById('kaynakListesi'); 
    if(!kutu) return; 
    kutu.innerHTML = ''; 
    if(liste.length === 0) { 
        kutu.innerHTML = '<div style="color: var(--text-secondary); font-style: italic;">Koçun henüz kaynak eklememiş.</div>'; 
        return; 
    } 
    liste.forEach(k => { 
        let bittiMi = benimTamamlananKaynaklar.includes(k.id);
        let butonHtml = bittiMi 
            ? `<span style="color:#10b981; font-weight:900; font-size:12px;">✅ Bitti</span>` 
            : `<button onclick="kaynakBitir(${k.id}, '${k.baslik}')" style="background:linear-gradient(135deg, #10b981, #059669); color:white; border:none; padding:8px 12px; border-radius:10px; cursor:pointer; font-weight:900; font-size:12px; box-shadow:0 4px 10px rgba(16, 185, 129, 0.2);">Bitirdim (+5 XP)</button>`;
            
        kutu.innerHTML += `
        <div class="kaynak-item" style="background:var(--bg-input); padding:15px; border-radius:12px; margin-bottom:10px; text-align:left; border-left:5px solid #8b5cf6; border: 1px solid var(--border-light);">
            <div style="font-weight:900; color:var(--text-primary); font-size:14px; margin-bottom:8px;">${k.baslik}</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <a href="${k.url}" target="_blank" style="color:#4f46e5; text-decoration:none; font-size:13px; font-weight:900; background:rgba(99, 102, 241, 0.1); padding:8px 12px; border-radius:10px;">🔗 İncele</a>
                ${butonHtml}
            </div>
        </div>`; 
    }); 
});

socket.on('yeni_kaynak_eklendi', (kaynak) => { 
    sesCal(); 
    sistemBildirimi("📚 Yeni Kaynak", `Koçun kütüphaneye yeni bir kaynak ekledi: ${kaynak.baslik}`); 
    socket.emit('join_room', kocKodu); 
});

function chatEkranaBas(veri) { 
    const body = document.getElementById('chatBody'); 
    let benMiyim = (veri.gonderen === aktifOgrenci);
    let renk = benMiyim ? '#3b82f6' : 'var(--bg-container)';
    let yaziRengi = benMiyim ? 'white' : 'var(--text-primary)';
    let hizalama = benMiyim ? 'flex-end' : 'flex-start';
    let ikon = veri.rol === 'koc' ? '👨‍🏫' : '💬'; 
    let icerik = veri.tip === 'resim' ? `<img src="${veri.mesaj}" style="max-width: 100%; border-radius: 8px; margin-top: 5px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" onclick="window.open('${veri.mesaj}', '_blank')">` : veri.mesaj; 
    
    body.innerHTML += `<div style="align-self: ${hizalama}; background: ${renk}; color: ${yaziRengi}; padding: 10px 14px; border-radius: 14px; font-size: 13px; max-width: 80%; line-height: 1.4; margin-bottom: 10px; font-weight: 700; border: 1px solid var(--border-light);"><div style="font-size: 10px; font-weight: 900; margin-bottom: 4px; opacity: 0.8;">${ikon} ${veri.gonderen} • ${veri.saat}</div>${icerik}</div>`; 
    body.scrollTop = body.scrollHeight; 
}

socket.on('eski_chat_yukle', (gecmis) => { 
    let body = document.getElementById('chatBody');
    if(body) body.innerHTML = ''; 
    gecmis.forEach(msg => chatEkranaBas(msg)); 
});

socket.on('yeni_chat_mesaji', (msg) => { 
    chatEkranaBas(msg); 
    const body = document.getElementById('chatBody'); 
    if(msg.gonderen !== aktifOgrenci) { 
        sesCal(); 
        if(body && body.style.display !== 'flex' && document.getElementById('chatUyari')) {
            document.getElementById('chatUyari').style.display = 'flex'; 
        }
        sistemBildirimi("💬 Sınıftan Mesaj Var", `${msg.gonderen}: ${msg.tip === 'resim' ? 'Bir fotoğraf gönderdi' : msg.mesaj}`); 
    } 
});

socket.on('chatbot_cevabi', (cevapMetni) => { 
    sesCal(); 
    const body = document.getElementById('botBody'); 
    body.innerHTML += `<div style="align-self: flex-start; background: var(--bg-container); color: var(--text-primary); padding: 10px 14px; border-radius: 14px; font-size: 13px; max-width: 80%; line-height: 1.4; margin-bottom: 10px; font-weight: 700; border: 1px solid var(--border-light);"><div style="font-size: 10px; font-weight: 900; margin-bottom: 4px; opacity: 0.8;">🤖 KatalizApp AI</div>${cevapMetni}</div>`; 
    body.scrollTop = body.scrollHeight; 
});

// ==========================================
// 6. BAŞLANGIÇ AYARLARI (ONLOAD)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    
    seriKontrol();
    
    if(sinavSecimi) {
        for(let s in MUFREDAT) { 
            sinavSecimi.innerHTML += `<option value="${s}">${s}</option>`; 
        }
    }
    
    let savedSinav = localStorage.getItem(`${aktifOgrenci}_secilenSinav`) || 'YKS'; 
    let savedDers = localStorage.getItem(`${aktifOgrenci}_secilenDers`) || 'TYT Matematik'; 
    let savedKonu = localStorage.getItem(`${aktifOgrenci}_secilenKonu`) || 'Temel Kavramlar';
    
    if(sinavSecimi) sinavSecimi.value = savedSinav; 
    mufredatYukle(true);
    
    if(dersSecimiUI && dersSecimiUI.querySelector(`option[value="${savedDers}"]`)) {
        dersSecimiUI.value = savedDers; 
    } else if (dersSecimiUI) {
        dersSecimiUI.selectedIndex = 0;
    }
    
    konuYukle(true);
    
    if(konuSecimi && konuSecimi.querySelector(`option[value="${savedKonu}"]`)) {
        konuSecimi.value = savedKonu; 
    } else if (konuSecimi) {
        konuSecimi.selectedIndex = 0;
    }
    
    aktifDersString = getDers();
    mode = localStorage.getItem(`${aktifOgrenci}_mode`) || 'normal';
    
    let mNormal = document.getElementById('modeNormal');
    let mPomo = document.getElementById('modePomo');
    let pInput = document.getElementById('pomoInput');

    if(mode === 'pomodoro') { 
        if(pInput) pInput.value = localStorage.getItem(`${aktifOgrenci}_pomoDuration`) || 25; 
        if(pInput) pInput.style.display = 'block'; 
        if(mNormal) mNormal.className = 'mode-btn mode-passive'; 
        if(mPomo) {
            mPomo.className = 'mode-btn mode-active'; 
            mPomo.style.background = '#ef4444'; 
            mPomo.style.boxShadow = '0 4px 0 #b91c1c'; 
        }
    } else { 
        if(pInput) pInput.style.display = 'none'; 
    }
    
    let sTime = parseInt(localStorage.getItem(`${aktifOgrenci}_${aktifDersString}_savedTime`)) || 0;
    
    if(localStorage.getItem(`${aktifOgrenci}_running`) === 'true') {
        running = true; 
        startBtn.style.display = 'none'; 
        pauseBtn.style.display = 'block'; 
        
        let statusT = document.getElementById('statusText');
        if(statusT) {
            statusT.innerHTML = "🟢 Odak modu aktif!"; 
            statusT.style.backgroundColor = "rgba(16, 185, 129, 0.1)"; 
            statusT.style.color = "#10b981"; 
        }
        
        if(pInput) pInput.disabled = true;
        
        tInterval = setInterval(() => { 
            let sessionElapsed = new Date().getTime() - parseInt(localStorage.getItem(`${aktifOgrenci}_startTime`));
            let totalDiff = sessionElapsed + (parseInt(localStorage.getItem(`${aktifOgrenci}_${aktifDersString}_savedTime`)) || 0); 
            
            let bittiMi = false;
            if (mode === 'pomodoro') {
                bittiMi = gostergeyiGuncelle(sessionElapsed);
            } else {
                bittiMi = gostergeyiGuncelle(totalDiff);
            }
            
            if (bittiMi && mode === 'pomodoro') { 
                sesCal(); 
                window.pauseTimer(true); 
                sistemBildirimi("🍅 Pomodoro Bitti!", "Harika odaklandın, şimdi mola vakti."); 
                
                if(typeof pomodoroTamamlandiMekanikleri === 'function') {
                    pomodoroTamamlandiMekanikleri();
                }
            } 
            
            socket.emit('sure_guncelle', { ogrenciAd: aktifOgrenci, sure: display.innerHTML, kocKodu: kocKodu }); 
        }, 1000);
        
        socket.emit('ogrenci_derse_basladi', { ogrenciAd: aktifOgrenci, ders: aktifDersString, mesaj: 'Derse geri döndü', kocKodu: kocKodu });
        
        rastgeleYoklamaKur();
        
    } else { 
        if (sTime > 0 && mode === 'normal') startBtn.innerHTML = "▶ Devam Et"; 
        gostergeyiGuncelle(sTime); 
    }

    socket.emit('ogrenci_derse_basladi', { 
        ogrenciAd: aktifOgrenci, 
        ders: aktifDersString, 
        mesaj: 'Sisteme giriş yaptı 🟢', 
        kocKodu: kocKodu 
    });
});