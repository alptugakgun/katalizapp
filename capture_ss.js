const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

(async () => {
    console.log("Starting server...");
    const server = spawn('node', ['server.js']);
    
    // Server loglarını da yakala (opsiyonel)
    server.stdout.on('data', (data) => console.log(`Server: ${data}`));
    server.stderr.on('data', (data) => console.error(`Server Error: ${data}`));

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        console.log("Capturing Student Dashboard...");
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
        await page.type('#ogrAd', 'Ali');
        await page.type('#ogrSifre', '1453Alp1.');
        await page.keyboard.press('Enter');
        
        // Wait for page to load completely after login
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        await page.screenshot({ path: 'public/assets/student_mockup.png' });
        console.log("Student screenshot saved.");

        console.log("Capturing Teacher Dashboard...");
        await page.goto('http://localhost:3000/ogretmen-login', { waitUntil: 'networkidle0' });
        await page.type('#kocAd', 'Alptuğ');
        await page.type('#kocSifre', '1453Alp1.');
        await page.keyboard.press('Enter');
        
        // Wait for page to load completely after login
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        await page.screenshot({ path: 'public/assets/teacher_mockup.png' });
        console.log("Teacher screenshot saved.");

    } catch (e) {
        console.error("Error during capture:", e);
    } finally {
        await browser.close();
        server.kill();
        process.exit(0);
    }
})();
