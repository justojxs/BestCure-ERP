const fs = require('fs');
const path = require('path');

const destDir = path.join(__dirname, '..', 'frontend', 'public', 'products');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const queries = [
    "Amoxicillin",
    "Ivermectin",
    "Rabies_vaccine",
    "Meloxicam",
    "Calcium_supplement", // might need to be "Calcium" or "Dietary_supplement"
    "Dexamethasone",
    "Oxytetracycline",
    "Canine_parvovirus_vaccine",
    "Albendazole",
    "B_vitamins",
    "Enrofloxacin",
    "Fipronil"
];

const fallbackUrls = [
    "https://upload.wikimedia.org/wikipedia/commons/2/2a/Amoxicillin_500mg_capsules.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/6a/Ivermectin_3mg.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/eb/Rabies_vaccine.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meloxicam_15_mg_tbl.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/a/ad/Calcium_pills.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/36/Dexamethasone_injection_vial.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/ff/Oxytetracycline.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b3/Parvovirus_vaccine.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/05/Albendazole_400mg_tablet.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/18/B-complex_vitamin.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/5a/Enrofloxacin.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/d/da/Fipronil_spot-on.jpg"
];

async function run() {
    for (let i = 0; i < queries.length; i++) {
        const q = queries[i];
        const filename = `product-${i + 1}.jpg`;
        const destPath = path.join(destDir, filename);

        console.log(`Fetching image for ${q}`);
        try {
            const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${q}&prop=pageimages&format=json&pithumbsize=500`;
            const res = await fetch(url, { headers: { 'User-Agent': 'BestCure/1.0' } });
            const data = await res.json();

            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            let imgUrl = null;

            if (pageId !== "-1" && pages[pageId].thumbnail) {
                imgUrl = pages[pageId].thumbnail.source;
            }

            if (!imgUrl) {
                console.log(`No image from wikipedia for ${q}, searching generic medical photo`);
                // Fallback: search unsplash or pexels or use a completely dummy abstract image via dummyimage api
                imgUrl = `https://dummyimage.com/400x300/e2e8f0/475569.jpg&text=${q.replace(/_/g, '+')}`;
            }

            const imgRes = await fetch(imgUrl, { headers: { 'User-Agent': 'BestCure/1.0' } });
            const buffer = await imgRes.arrayBuffer();
            fs.writeFileSync(destPath, Buffer.from(buffer));
            console.log(`Saved ${filename} from ${imgUrl}`);
        } catch (e) {
            console.error(`Failed ${q}:`, e.message);
        }
    }
}

run();
