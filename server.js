const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
    console.log(`[REQ] ${req.url}`);

    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

    // Strip query strings if present
    filePath = filePath.split('?')[0];

    const extname = String(path.extname(filePath)).toLowerCase();

    // Prevent directory traversal attacks
    filePath = path.normalize(filePath);
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            const contentType = MIME_TYPES[extname] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('\n=======================================');
    console.log(`Server successfully started!`);
    console.log(`Your website is live at: http://localhost:${PORT}`);
    console.log('=======================================\n');
});
