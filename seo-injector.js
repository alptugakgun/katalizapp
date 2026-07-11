const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

const metaTags = `
    <!-- KATALIZAPP SEO ETİKETLERİ -->
    <meta name="description" content="KatalizApp - Eğitimde oyunlaştırma ve yapay zeka destekli yeni nesil dijital koçluk platformu. Sınavlara (YKS, LGS) hazırlanırken XP kazan, sıralamanı gör, koçunla zirveye ulaş.">
    <meta name="keywords" content="eğitim koçluğu, yks, lgs, sınav hazırlık, oyunlaştırma, yapay zeka koçu, dijital eğitim platformu, öğrenci takibi, KatalizApp, eğitim yönetimi">
    <meta name="author" content="KatalizApp">
    <meta name="robots" content="index, follow">
    <meta name="language" content="Turkish">
    
    <!-- Open Graph (Sosyal Medya Görünümü) -->
    <meta property="og:title" content="KatalizApp - Eğitimde Yeni Nesil Koçluk">
    <meta property="og:description" content="Eğitimde oyunlaştırma ve yapay zeka devrimi. XP (Deneyim Puanı) kazanarak ders çalış, koçunla hedeflerine ulaş.">
    <meta property="og:url" content="https://egitim-kocu-projesi2.onrender.com/">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="KatalizApp">
    
    <!-- Twitter Kartları -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="KatalizApp - Eğitimde Yeni Nesil Koçluk">
    <meta name="twitter:description" content="Eğitimde oyunlaştırma ve yapay zeka devrimi. Deneyim puanları kazanarak ders çalış.">
    <!-- SEO SONU -->
`;

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Zaten eklenmişse tekrar ekleme
    if (content.includes('KATALIZAPP SEO ETİKETLERİ')) {
        console.log(`Atlandı: ${file} (Zaten SEO var)`);
        return;
    }

    // </head> tag'ından hemen önce ekle
    content = content.replace('</head>', `${metaTags}\n</head>`);
    
    fs.writeFileSync(filePath, content);
    console.log(`SEO Başarıyla Eklendi: ${file}`);
});

console.log('Tüm sayfalara SEO entegrasyonu tamamlandı.');
