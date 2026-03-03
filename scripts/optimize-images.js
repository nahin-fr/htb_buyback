import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

const compressImage = async (filename, width) => {
    const inputPath = path.join(publicDir, filename);
    const parsedPath = path.parse(filename);
    const outputPath = path.join(publicDir, `${parsedPath.name}.webp`);

    try {
        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${filename} - file not found.`);
            return;
        }

        let pipeline = sharp(inputPath);

        if (width) {
            pipeline = pipeline.resize({ width, withoutEnlargement: true });
        }

        await pipeline
            .webp({ quality: 80 })
            .toFile(outputPath);

        console.log(`Successfully compressed ${filename} -> ${parsedPath.name}.webp`);
    } catch (error) {
        console.error(`Error compressing ${filename}:`, error);
    }
};

const run = async () => {
    console.log('Starting image compression...');

    // Abstract feature image: typically displayed max 800px wide
    await compressImage('feature_abstract.png', 800);

    // Logos: Displayed very small (32px), but we'll keep it at 100px for retina displays
    await compressImage('logo.png', 100);
    await compressImage('logo_dark.png', 100);

    console.log('Image compression complete!');
};

run();
