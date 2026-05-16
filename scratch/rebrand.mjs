import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const replacements = [
  { search: /SHOPSPHERE/g, replace: 'LUXURY LINE' },
  { search: /ShopSphere/g, replace: 'Luxury Line' },
  { search: /shopsphere/g, replace: 'luxury-line' }
];

const excludeDirs = ['.git', 'node_modules', 'dist', '.vercel', 'prisma'];
const excludeFiles = ['rebrand.mjs', 'bun.lockb', 'package-lock.json', 'BRANDED TURKEY PERFUME  2.pdf'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { search, replace } of replacements) {
    if (search.test(content)) {
      content = content.replace(search, replace);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        walkDir(fullPath);
      }
    } else {
      if (!excludeFiles.includes(file) && (
        file.endsWith('.ts') || 
        file.endsWith('.tsx') || 
        file.endsWith('.js') || 
        file.endsWith('.jsx') || 
        file.endsWith('.json') || 
        file.endsWith('.html') || 
        file.endsWith('.css') || 
        file.endsWith('.md')
      )) {
        try {
          processFile(fullPath);
        } catch (e) {
          console.error(`❌ Error processing ${fullPath}: ${e.message}`);
        }
      }
    }
  }
}

console.log('🚀 Starting rebranding from SHOPSPHERE to LUXURY LINE...');
walkDir(rootDir);
console.log('✨ Rebranding complete!');
