import fs from 'fs';
import path from 'path';

const destDir = path.join('dist-electron', 'electron');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(
  path.join('electron', 'splash.html'),
  path.join(destDir, 'splash.html')
);

fs.copyFileSync(
  path.join('electron', 'icon.png'),
  path.join(destDir, 'icon.png')
);

fs.copyFileSync(
  path.join('electron', '5080_logo.png'),
  path.join(destDir, '5080_logo.png')
);

console.log('Static assets copied to dist-electron/electron/');
