const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'src');
const allowedSegment = "common/constants/field-limits";
const targetPattern = /from\s+['"]([^'"]*field-limits[^'"]*)['"]/g;
const violations = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!fullPath.endsWith('.ts') && !fullPath.endsWith('.tsx')) continue;

    const source = fs.readFileSync(fullPath, 'utf8');
    let match;
    while ((match = targetPattern.exec(source)) !== null) {
      const importPath = match[1];
      if (!importPath.includes(allowedSegment)) {
        violations.push(`${path.relative(path.resolve(__dirname, '..'), fullPath)} -> ${importPath}`);
      }
    }
  }
}

walk(root);

if (violations.length > 0) {
  console.error('Invalid field-limits imports found in api project:');
  for (const line of violations) console.error(`- ${line}`);
  process.exit(1);
}

console.log('Field-limits import check passed for api.');
