import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Create a 512x512 canvas
const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

// Create a gradient background
const gradient = ctx.createLinearGradient(0, 0, 512, 512);
gradient.addColorStop(0, '#200052');
gradient.addColorStop(0.5, '#836EF9');
gradient.addColorStop(1, '#A0055D');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 512, 512);

// Draw a coin
ctx.beginPath();
ctx.arc(256, 256, 200, 0, Math.PI * 2);
ctx.fillStyle = '#FFFFFF';
ctx.fill();

// Add a shadow
ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
ctx.shadowBlur = 20;
ctx.shadowOffsetX = 10;
ctx.shadowOffsetY = 10;

// Draw the coin face
ctx.beginPath();
ctx.arc(256, 256, 180, 0, Math.PI * 2);
ctx.fillStyle = '#836EF9';
ctx.fill();

// Add text
ctx.shadowColor = 'transparent';
ctx.font = 'bold 120px Arial';
ctx.fillStyle = '#FFFFFF';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('CF', 256, 256);

// Save the image
const buffer = canvas.toBuffer('image/png');
const outputPath = path.join(process.cwd(), 'public', 'coinflip-icon.png');
fs.writeFileSync(outputPath, buffer);

console.log(`Icon generated at: ${outputPath}`); 