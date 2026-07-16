const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    try {
        console.log("Capturing Student Dashboard...");
        await page.goto('https://egitim-kocu-projesi2.onrender.com/login', { waitUntil: 'networkidle0' });
        await page.type('#ogrAd', 'Ali');
        await page.type('#ogrSifre', '1453Alp1.');
        
        // Use click instead of Enter
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for(let b of buttons) {
                if(b.innerText.includes('Katalizör')) {
                    b.click();
                }
            }
        });
        
        // Wait for URL to change to /ogrenci
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => console.log("Navigation timeout"));
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log("Current URL after student login:", page.url());
        await page.screenshot({ path: 'public/assets/student_mockup.png' });
        console.log("Student screenshot saved.");

        console.log("Capturing Teacher Dashboard...");
        await page.goto('https://egitim-kocu-projesi2.onrender.com/ogretmen-login', { waitUntil: 'networkidle0' });
        await page.type('#kocAd', 'Alptuğ');
        await page.type('#kocSifre', '1453Alp1.');
        
        await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for(let b of buttons) {
                if(b.innerText.includes('Sınıfıma Gir')) {
                    b.click();
                }
            }
        });
        
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => console.log("Navigation timeout"));
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log("Current URL after teacher login:", page.url());
        await page.screenshot({ path: 'public/assets/teacher_mockup.png' });
        console.log("Teacher screenshot saved.");

    } catch (e) {
        console.error("Error during capture:", e);
    } finally {
        await browser.close();
        process.exit(0);
    }
})();
