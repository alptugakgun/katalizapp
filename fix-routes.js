const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html') || f.endsWith('.js'));

files.forEach(file => {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 1. href="sayfa.html" -> href="/sayfa"
    content = content.replace(/href="(kayit|login|ogretmen-kayit|ogretmen-login|veli-login|index|ogrenci|ogretmen|veli)\.html"/g, 'href="/$1"');
    
    // 2. window.location.href='sayfa.html' -> window.location.href='/sayfa'
    content = content.replace(/window\.location\.href\s*=\s*'([^']+)\.html'/g, "window.location.href='/$1'");
    content = content.replace(/window\.location\.href\s*=\s*"([^"]+)\.html"/g, 'window.location.href="/$1"');

    // 3. /index yönlendirmelerini kök dizin olan / olarak düzelt
    content = content.replace(/href="\/index"/g, 'href="/"');
    content = content.replace(/window\.location\.href\s*=\s*'\/index'/g, "window.location.href='/'");
    content = content.replace(/window\.location\.href\s*=\s*"\/index"/g, 'window.location.href="/"');

    fs.writeFileSync(filePath, content);
});

console.log('Tüm yönlendirmeler başarıyla temizlendi ve clean-URL (uzantısız link) yapısına geçirildi!');
