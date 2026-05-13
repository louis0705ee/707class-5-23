// server.js (請完全覆蓋)
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const API_KEY = process.env.JSONBIN_API_KEY;
const ORDER_BIN_ID = process.env.ORDER_BIN_ID;
const MENU_BIN_ID = process.env.MENU_BIN_ID;
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'LMSH707';

app.get('/api/menu', async (req, res) => {
    try {
        const resp = await fetch(`https://api.jsonbin.io/v3/b/${MENU_BIN_ID}/latest`, {
            headers: { "X-Master-Key": API_KEY }
        });
        const data = await resp.json();
        res.json(data.record || []);
    } catch (e) { res.status(500).send("Error"); }
});

app.put('/api/menu', async (req, res) => {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${MENU_BIN_ID}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY },
            body: JSON.stringify(req.body)
        });
        res.sendStatus(200);
    } catch (e) { res.status(500).send("Error"); }
});

app.get('/api/orders', async (req, res) => {
    try {
        const resp = await fetch(`https://api.jsonbin.io/v3/b/${ORDER_BIN_ID}/latest`, {
            headers: { "X-Master-Key": API_KEY }
        });
        const data = await resp.json();
        res.json(data.record || []);
    } catch (e) { res.status(500).send("Error"); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const getResp = await fetch(`https://api.jsonbin.io/v3/b/${ORDER_BIN_ID}/latest`, {
            headers: { "X-Master-Key": API_KEY }
        });
        const oldData = await getResp.json();
        let allOrders = oldData.record || [];
        allOrders.push(req.body);

        await fetch(`https://api.jsonbin.io/v3/b/${ORDER_BIN_ID}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY },
            body: JSON.stringify(allOrders)
        });
        res.sendStatus(200);
    } catch (e) { res.status(500).send("Error"); }
});

// 新增：用來覆蓋（刪除）訂單的後端功能
app.put('/api/orders', async (req, res) => {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${ORDER_BIN_ID}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY },
            body: JSON.stringify(req.body)
        });
        res.sendStatus(200);
    } catch (e) { res.status(500).send("Error"); }
});

app.post('/api/admin-login', (req, res) => {
    const { user, pass } = req.body;
    if (user === 'twlmsh707' && pass === ADMIN_PASS) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
