const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');

const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb+srv://sunayseyidli01_db_user:HIPElclZuiSHhsla@cluster0.4mmuitx.mongodb.net/?retryWrites=true&w=majority';
const DB_NAME = 'excel_satis';
const COLLECTION_NAME = 'satislar';

const client = new MongoClient(MONGO_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectDB() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log('✅ MongoDB-ə qoşuldu');
    } catch(e) {
        console.error('❌ MongoDB xətası:', e.message);
        process.exit(1);
    }
}

async function getData() {
    try {
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);
        return await collection.find({}).sort({ _id: -1 }).toArray();
    } catch(e) {
        console.error('Oxuma xətası:', e.message);
        return [];
    }
}

async function appendData(obj) {
    try {
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);
        return await collection.insertOne(obj);
    } catch(e) {
        console.error('Yazma xətası:', e.message);
        return null;
    }
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    if (req.url === '/api/data' && req.method === 'GET') {
        try {
            const data = await getData();
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(data));
        } catch(e) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Server xətası' }));
        }
        return;
    }

    if (req.url === '/api/data' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const obj = JSON.parse(body);
                obj.createdAt = new Date().toISOString();
                await appendData(obj);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true }));
            } catch(e) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Yanlış məlumat' }));
            }
        });
        return;
    }

    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Server xətası');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
    });
});

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`✅ Server: http://localhost:${PORT}`);
        console.log(`🗄️ MongoDB: excel_satis/satislar`);
    });
});
