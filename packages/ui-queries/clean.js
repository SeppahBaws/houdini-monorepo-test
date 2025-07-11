import fs from 'node:fs';

fs.rmSync('src/houdini', { recursive: true, force: true });
