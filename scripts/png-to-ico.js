import fs from 'fs';
import path from 'path';

const pngPath = path.join('electron', 'resources', 'icon.png');
const icoPath = path.join('electron', 'resources', 'icon.ico');

if (!fs.existsSync(pngPath)) {
  console.error('PNG icon not found at', pngPath);
  process.exit(1);
}

const pngData = fs.readFileSync(pngPath);
const pngSize = pngData.length;

// ICO header (6 bytes)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // Reserved
header.writeUInt16LE(1, 2); // Type (1 = ICO)
header.writeUInt16LE(1, 4); // Count (1 image)

// Directory entry (16 bytes)
const entry = Buffer.alloc(16);
entry.writeUInt8(0, 0);      // Width 256 (0 means 256)
entry.writeUInt8(0, 1);      // Height 256 (0 means 256)
entry.writeUInt8(0, 2);      // Color count
entry.writeUInt8(0, 3);      // Reserved
entry.writeUInt16LE(1, 4);   // Color planes
entry.writeUInt16LE(32, 6);  // Bits per pixel (32-bit)
entry.writeUInt32LE(pngSize, 8); // Size of PNG data
entry.writeUInt32LE(22, 12);  // Offset (6 + 16 = 22)

// Combine everything
const icoData = Buffer.concat([header, entry, pngData]);
fs.writeFileSync(icoPath, icoData);
console.log('Successfully generated icon.ico at', icoPath);
