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
        const resp = await fetch(`https://api.jsonbin.io/v3/b/${MENU_BIN_ID}/latest`, { headers: { "X-Master-Key": API_KEY } });
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
        const resp = await fetch(`https://api.jsonbin.io/v3/b/${ORDER_BIN_ID}/latest`, { headers: { "X-Master-Key": API_KEY } });
        const data = await resp.json();
        res.json(data.record || []);
    } catch (e) { res.status(500).send("Error"); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { orderData, rawCart } = req.body; 

        // 1. 扣除庫存
        const menuResp = await fetch(`https://api.jsonbin.io/v3/b/${MENU_BIN_ID}/latest`, { headers: { "X-Master-Key": API_KEY } });
        const menuDataObj = await menuResp.json();
        let menuData = menuDataObj.record || [];

        for (let id in rawCart) {
            let qty = rawCart[id];
            let item = menuData.find(i => i.id === id);
            if (item && item.stock !== undefined) {
                item.stock = Math.max(0, item.stock - qty);
            }
        }

        await fetch(`https://api.jsonbin.io/v3/b/${MENU_BIN_ID}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY },
            body: JSON.stringify(menuData)
        });

        // 2. 儲存訂單
        const orderResp = await fetch(`https://api.jsonbin.io/v3/b/${ORDER_BIN_ID}/latest`, { headers: { "X-Master-Key": API_KEY } });
        const orderDataObj = await orderResp.json();
        let allOrders = orderDataObj.record || [];
        allOrders.push(orderData);

        await fetch(`https://api.jsonbin.io/v3/b/${ORDER_BIN_ID}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY },
            body: JSON.stringify(allOrders)
        });
        
        res.sendStatus(200);
    } catch (e) { res.status(500).send("Error"); }
});

app.put('/api/orders', async (req, res) => {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${ORDER_BIN_ID}`, { method: 'PUT', headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY }, body: JSON.stringify(req.body) });
        res.sendStatus(200);
    } catch (e) { res.status(500).send("Error"); }
});

app.post('/api/admin-login', (req, res) => {
    const { user, pass } = req.body;
    if (user === 'twlmsh707' && pass === ADMIN_PASS) { res.json({ success: true }); } 
    else { res.status(401).json({ success: false }); }
});

app.listen(port, () => console.log(`Server running on port ${port}`));