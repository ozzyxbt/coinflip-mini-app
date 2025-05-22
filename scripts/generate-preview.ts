import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const width = 1200;
const height = 630;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background gradient
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#200052');
gradient.addColorStop(0.5, '#836EF9');
gradient.addColorStop(1, '#A0055D');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Title
ctx.fillStyle = 'white';
ctx.font = 'bold 72px Inter';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('CoinFlip', width / 2, height / 2 - 50);

// Subtitle
ctx.font = '36px Inter';
ctx.fillText('Double or nothing', width / 2, height / 2 + 50);

// Save the image
const buffer = canvas.toBuffer('image/png');
const outputPath = path.join(process.cwd(), 'public', 'coinflip-preview.png');
fs.writeFileSync(outputPath, buffer);

console.log('Preview image generated at:', outputPath); 