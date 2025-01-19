const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const folderPath = './html'; // Folder containing HTML files
    const outputPath = './img'; // Folder to save preview images
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.html'));

    // Ensure output folder exists
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // for (const file of files) {
    //     const filePath = path.join(folderPath, file);
    //     const previewPath = path.join(outputPath, `${path.basename(file, '.html')}.png`);
        
    //     console.log(`Generating preview for ${file}`);
    //     await page.goto(`file://${path.resolve(filePath)}`, { waitUntil: 'networkidle2' });
    //     await page.screenshot({ path: previewPath, fullPage: true });
    //     console.log(`Preview saved: ${previewPath}`);
    // }

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const previewPrefix = path.join(outputPath, path.basename(file, '.html'));

        console.log(`Processing ${file}...`);
        await page.goto(`file://${path.resolve(filePath)}`, { waitUntil: 'networkidle2' });

        // Find all canvas elements
        const canvasElements = await page.$$('canvas');
        if (canvasElements.length === 0) {
            console.log(`No canvas elements found in ${file}`);
            continue;
        }

        for (let i = 0; i < canvasElements.length; i++) {
            const canvas = canvasElements[i];
            const boundingBox = await canvas.boundingBox();
            if (boundingBox) {
                const previewPath = `${previewPrefix}.png`;
                await page.screenshot({
                    path: previewPath,
                    clip: boundingBox, // Capture only the canvas area
                });
                console.log(`Captured canvas ${i + 1} preview for ${file} at ${previewPath}`);
            }
        }
    }

    await browser.close();
    console.log('All previews generated successfully.');
})();