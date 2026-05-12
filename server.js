const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 告訴伺服器：把 public 資料夾裡的東西對外公開
app.use(express.static('public'));

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器已經啟動，正在監聽 port ${port}`);
});