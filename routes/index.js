var express = require('express');
var router = express.Router();

const mariadb = require("mariadb");

// 設定 MariaDB 連接配置
const pool = mariadb.createPool({
  host: "192.168.100.13",
  user: "kevin",
  password: "111111",
  database: "mydb",
  connectionLimit: 5,
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 新增用戶 (Create)
router.post("/serverbuild", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { brand, hostname, model, serial_number } = req.body;
    const result = await connection.query("INSERT INTO serverlist (`brand`, `hostname`, `model`, `serial_number`) VALUES (?, ?, ?, ?)", [brand, hostname, model, serial_number]);
    res.status(201).json({ id: result.insertId.toString, brand, hostname, model, serial_number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// 獲取用戶列表 (Read)
router.get("/serverbuild", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const rows = await connection.query("SELECT * FROM serverlist");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// 更新用戶 (Update)
router.put("/serverbuild/:svr_id", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { svr_id } = req.params;
    const { brand, hostname, model, serial_number } = req.body;

    // 創建一個包含要更新的鍵值對的對象
    const updates = {};
    if (brand) updates.brand = brand;
    if (hostname) updates.hostname = hostname;
    if (model) updates.model = model;
    if (serial_number) updates.serial_number = serial_number;

    // 動態生成 SQL 查詢
    const updateFields = Object.keys(updates).map(key => `\`${key}\` = ?`).join(', ');
    const updateValues = Object.values(updates);
    const query = `UPDATE serverlist SET ${updateFields} WHERE \`svr_id\` = ?`;

    // 執行查詢
    const result = await connection.query(query, [...updateValues, svr_id]);

    // 檢查是否有更新記錄
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Record not found" });
    } else {
      res.status(200).json({ message: "Record updated successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// 刪除用戶 (Delete)
router.delete("/serverbuild/:svr_id", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { svr_id } = req.params;
    const result = await connection.query("DELETE FROM serverlist WHERE `svr_id` = ?", [svr_id]);

    // 檢查是否有刪除記錄
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Record not found" });
    } else {
      res.status(200).json({ message: "Record deleted successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});


module.exports = router;