const fs = require('fs');
const path = require('path');

const version = {
    buildTime: new Date().toISOString(),
    timestamp: Date.now()
};

const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(
    path.join(publicDir, 'version.json'),
    JSON.stringify(version, null, 2)
);

console.log('✅ Generated public/version.json:', version);
