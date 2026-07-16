const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        console.log("Capturing Student Dashboard...");
        await page.goto('https://egitim-kocu-projesi2.onrender.com/login', { waitUntil: 'networkidle0' });
        await page.type('#ogrAd', 'Ali');
        await page.type('#ogrSifre', '1453Alp1.');
        await page.keyboard.press('Enter');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        await page.screenshot({ path: 'public/assets/student_mockup.png' });
        console.log("Student screenshot saved.");

        console.log("Capturing Teacher Dashboard...");
        await page.goto('https://egitim-kocu-projesi2.onrender.com/ogretmen-login', { waitUntil: 'networkidle0' });
        await page.type('#kocAd', 'Alptuğ');
        await page.type('#kocSifre', '1453Alp1.');
        await page.keyboard.press('Enter');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        await page.screenshot({ path: 'public/assets/teacher_mockup.png' });
        console.log("Teacher screenshot saved.");

    } catch (e) {
        console.error("Error during capture:", e);
    } finally {
        await browser.close();
        process.exit(0);
    }
})();
