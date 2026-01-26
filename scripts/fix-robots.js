const fs = require('fs');
const path = require('path');

const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');

try {
    if (fs.existsSync(robotsPath)) {
        const content = fs.readFileSync(robotsPath, 'utf8');
        const lines = content.split('\n');
        // Remove lines starting with "Host:" (ignoring whitespace)
        const filteredLines = lines.filter(line => !line.trim().startsWith('Host:'));
        const newContent = filteredLines.join('\n');
        fs.writeFileSync(robotsPath, newContent);
        console.log('Successfully removed Host directive from robots.txt');
    } else {
        console.log('robots.txt not found, skipping Host removal.');
    }
} catch (error) {
    console.error('Error processing robots.txt:', error);
    process.exit(1);
}
