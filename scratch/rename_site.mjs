import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const targetName = 'SHOPSPHERE';
const sourceName = 'SHOPSPHERE';
const sourceNameLower = 'shopsphere';
const targetNameLower = 'shopsphere';

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.antigravity') {
                walkDir(filePath);
            }
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.html') || file.endsWith('.prisma') || file.endsWith('.mjs')) {
                let content = fs.readFileSync(filePath, 'utf8');
                let newContent = content;
                
                // Case sensitive replacement
                newContent = newContent.split(sourceName).join(targetName);
                // Case insensitive for URL-like or lowercase strings
                newContent = newContent.split(sourceNameLower).join(targetNameLower);
                
                if (newContent !== content) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    console.log(`Updated: ${filePath}`);
                }
            }
        }
    }
}

walkDir(rootDir);
console.log('Renaming complete.');
