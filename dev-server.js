// dev-server.js - Manual development server untuk Lababil Sales App
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Import login function
const loginFunction = require('./netlify/functions/login.js');

const PORT = 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`${req.method} ${pathname}`);

    // Handle Netlify Functions
    if (pathname.startsWith('/.netlify/functions/')) {
        const functionName = pathname.replace('/.netlify/functions/', '');
        
        if (functionName === 'login') {
            try {
                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', async () => {
                    const event = {
                        httpMethod: req.method,
                        headers: req.headers,
                        body: body,
                        queryStringParameters: parsedUrl.query
                    };
                    
                    const context = {};
                    const result = await loginFunction.handler(event, context);
                    
                    // Set headers
                    res.writeHead(result.statusCode, result.headers || {});
                    res.end(result.body);
                });
                return;
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Function error: ' + error.message }));
                return;
            }
        }
    }

    // Handle static files
    let filePath = '.' + pathname;
    if (filePath === './') filePath = './index.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found - serve index.html for SPA routing
                fs.readFile('./index.html', (error, content) => {
                    if (error) {
                        res.writeHead(500);
                        res.end('Server Error');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Development server running at:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Functions: http://localhost:${PORT}/.netlify/functions/`);
    console.log('');
    console.log('📝 Test credentials:');
    console.log('   admin / admin123');
    console.log('   user / user123'); 
    console.log('   demo / demo123');
});