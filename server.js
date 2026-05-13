const express = require('express');
const fetch = require('node-fetch'); // 如果報錯請在 GitHub 的 package.json 加入 "node-fetch": "^2.6.7"
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// 從 Railway 的環境變數讀取秘密，不要直接寫在這裡
const API_KEY = process.env.JSONBIN_API_KEY;
const ORDER_BIN_ID = process.env.ORDER_BIN_ID;
const MENU_BIN_ID = process.env.MENU_BIN_ID;
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'LMSH707'; // 預設密碼

// --- 代理：獲取菜單 ---
app.get('/api/menu', async (req, res) => {
    try {
        const resp = await fetch(`https://api.jsonbin.io/v3/b/${MENU_BIN_ID}/latest`, {
            headers: { "X-Master-Key": API_KEY }
        });
        const data = await resp.json();
        res.json(data.record);
    } catch (e) { res.status(500).send("Error"); }
});

// --- 代理：提交訂單 ---
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

// --- 驗證管理員登入 ---
app.post('/api/admin-login', (req, res) => {
    const { user, pass } = req.body;
    if (user === 'twlmsh707' && pass === ADMIN_PASS) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
