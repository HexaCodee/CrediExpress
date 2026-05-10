const fs = require('fs');
const path = require('path');

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

function removeComments(content) {
  const lines = content.split('\n');
  return lines
    .map(line => {
      // Find // comment (not in strings)
      let inString = false;
      let stringChar = '';
      let inTemplate = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const prevChar = i > 0 ? line[i - 1] : '';
        
        if (char === '`' && prevChar !== '\\') {
          inTemplate = !inTemplate;
        } else if (!inTemplate && (char === '"' || char === "'" ) && prevChar !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
          }
        }
        
        if (!inString && !inTemplate && char === '/' && line[i + 1] === '/') {
          return line.substring(0, i).trimEnd();
        }
      }
      return line;
    })
    .filter(line => line.trim().length > 0 || line === '')
    .join('\n');
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = removeComments(content);
    fs.writeFileSync(filePath, cleaned, 'utf8');
    console.log(`✓ Cleaned: ${filePath}`);
  } catch (err) {
    console.error(`✗ Error processing ${filePath}:`, err.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDir(fullPath);
      }
    } else if (extensions.includes(path.extname(file))) {
      processFile(fullPath);
    }
  });
}

const srcDir = path.join(__dirname, 'src');
walkDir(srcDir);
console.log('\n✓ All comments removed!');
