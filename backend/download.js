const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const products = [
    "Amoxycillin 500mg capsules veterinary",
    "Ivermectin Injection for cattle",
    "Rabies Vaccine veterinary vial",
    "Meloxicam tablets veterinary",
    "Calcium Supplement for animals",
    "Dexamethasone Injection veterinary",
    "Oxytetracycline 300mg injection",
    "Parvovirus Vaccine dog",
    "Albendazole Bolus cattle",
    "Vitamin B Complex injection veterinary",
    "Enrofloxacin 100ml animal",
    "Fipronil Spray dogs"
];

const destDir = path.join(__dirname, '..', 'frontend', 'public', 'products');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

async function downloadImages() {
    for (let i = 0; i < products.length; i++) {
        const q = products[i];
        const filename = `product-${i + 1}.jpg`;
        const destPath = path.join(destDir, filename);

        console.log(`Downloading image for: ${q}`);
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q + ' product image')}`;

        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            const text = await res.text();
            const $ = cheerio.load(text);
            let imgUrl = null;

            // Extract imageURL from duckduckgo image results wrapper
            $('.result__image a').each((_, el) => {
                const href = $(el).attr('href');
                if (href && href.includes('imgur.com')) {
                    const match = href.match(/imgurl=(.*?)&/);
                    if (match) imgUrl = decodeURIComponent(match[1]);
                }
            });

            // If none found via images, try generic duckduckgo thumbnails
            if (!imgUrl) {
                const thumb = $('.zcm-wrap').nextAll().find('.result__thumbnail img').first().attr('src');
                if (thumb) {
                    imgUrl = thumb.startsWith('http') ? thumb : `https:${thumb}`;
                }
            }

            if (!imgUrl) {
                imgUrl = $('.result__snippet').find('img').first().attr('src');
            }

            if (imgUrl) {
                if (imgUrl.startsWith('//')) imgUrl = `https:${imgUrl}`;
                const imgRes = await fetch(imgUrl);
                const buffer = await imgRes.arrayBuffer();
                fs.writeFileSync(destPath, Buffer.from(buffer));
                console.log(`Saved ${filename} from ${imgUrl}`);
            } else {
                console.log(`No image found for ${q}`);
            }

            // small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 1500));
        } catch (err) {
            console.error(`Error for ${q}:`, err);
        }
    }
}

downloadImages();
