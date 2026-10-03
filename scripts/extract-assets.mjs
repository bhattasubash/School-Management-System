import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const refImagePath = 'C:/Users/SUBASH/.gemini/antigravity/brain/f4df2a64-d65e-4509-9b61-b66b30bd007d/.user_uploaded/media_1790936050080.png';
const outDir = './public/images/dashboard';

async function run() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const img = sharp(refImagePath);

  // 1. Clean school campus hero (school building + trees + sun, avoiding the quote text on left)
  // Let's crop starting at x: 715, y: 83, width: 280, height: 135
  await img
    .clone()
    .extract({ left: 715, top: 83, width: 280, height: 135 })
    .toFile(path.join(outDir, 'ref_school_hero_clean.png'));

  // 2. Study Materials card full crop
  await img
    .clone()
    .extract({ left: 232, top: 524, width: 375, height: 104 })
    .toFile(path.join(outDir, 'crop_card_study_materials.png'));

  // 3. My Results card full crop
  await img
    .clone()
    .extract({ left: 611, top: 524, width: 386, height: 104 })
    .toFile(path.join(outDir, 'crop_card_results.png'));

  // 4. Study Materials illustration only (with its halo/books)
  await img
    .clone()
    .extract({ left: 446, top: 526, width: 108, height: 100 })
    .toFile(path.join(outDir, 'crop_illust_study_materials.png'));

  // 5. My Results illustration only (with its halo/student)
  await img
    .clone()
    .extract({ left: 860, top: 526, width: 95, height: 100 })
    .toFile(path.join(outDir, 'crop_illust_results.png'));

  console.log('Extraction complete!');
}

run().catch(console.error);
