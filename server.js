const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.txt');

// data.txt yoxdursa yarat
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '', 'utf-8');
}

// Məlumatları oxu
function getData() {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
        if (!raw) return [];
        return raw.split('\n')
            .filter(line => line.trim())
            .map(line => {
                try { return JSON.parse(line); }
                catch(e) { return null; }
            })
            .filter(item => item !== null);
    } catch(e) {
        return [];
    }
}

// Məlumat əlavə et
function appendData(obj) {
    fs.appendFileSync(DATA_FILE, JSON.stringify(obj) + '\n', 'utf-8');
}

const server = http.createServer((req, res) => {
    // CORS başlıqları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    // API - Bütün məlumatları gətir
    if (req.url === '/api/data' && req.method === 'GET') {
        const data = getData();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(data));
    }

    // API - Yeni məlumat əlavə et
    if (req.url === '/api/data' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const obj = JSON.parse(body);
                appendData(obj);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true }));
            } catch(e) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: 'Yanlış məlumat formatı' }));
            }
        });
        return;
    }

    // Ana səhifə - index.html-i göstər
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Server xətası');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`✅ Server işləyir: http://localhost:${PORT}`);
    console.log(`📁 Məlumat faylı: ${DATA_FILE}`);
    console.log(`🌐 Brauzerdə aç: http://localhost:${PORT}`);
});
