const fs = require('fs');
const path = require('path');

const destDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'products');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const images = [
    { file: 'amoxycillin.jpg', url: 'https://www.valleyvet.com/swatches/30206_L_vvs_000.jpg' },
    { file: 'ivermectin.jpg', url: 'https://www.valleyvet.com/swatches/15234_L_vvs_000.jpg' },
    { file: 'rabies.jpg', url: 'https://www.valleyvet.com/swatches/11130_L_vvs_000.jpg' },
    { file: 'meloxicam.jpg', url: 'https://www.valleyvet.com/swatches/28570_L_vvs_000.jpg' },
    { file: 'calcium.jpg', url: 'https://www.valleyvet.com/swatches/38914_L_vvs_000.jpg' },
    { file: 'dexamethasone.jpg', url: 'https://www.valleyvet.com/swatches/11915_L_vvs_000.jpg' },
    { file: 'oxytetracycline.jpg', url: 'https://www.valleyvet.com/swatches/16641_L_vvs_000.jpg' },
    { file: 'parvovirus.jpg', url: 'https://www.valleyvet.com/swatches/30043_L_vvs_000.jpg' },
    { file: 'albendazole.jpg', url: 'https://www.valleyvet.com/swatches/16599_L_vvs_000.jpg' },
    { file: 'vitaminb.jpg', url: 'https://www.valleyvet.com/swatches/40114_L_vvs_000.jpg' },
    { file: 'enrofloxacin.jpg', url: 'https://www.valleyvet.com/swatches/23245_L_vvs_000.jpg' },
    { file: 'fipronil.jpg', url: 'https://www.valleyvet.com/swatches/25368_L_vvs_000.jpg' }
];

async function downloadImages() {
    for (const img of images) {
        const destPath = path.join(destDir, img.file);
        try {
            console.log(`Downloading ${img.url}...`);
            const res = await fetch(img.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const buffer = await res.arrayBuffer();
            fs.writeFileSync(destPath, Buffer.from(buffer));
            console.log(`Saved ${img.file}`);
        } catch (err) {
            console.error(`Failed to download ${img.file}: ${err.message}`);
        }
    }
}

downloadImages();
