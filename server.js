const http = require('http');
// 1. เรียกใชงาน Pool จากไลบรารี pg สําหรับจัดการการเชื่อมตอฐานขอมูล
const { Pool } = require('pg');
// 2. ตั้งคาการเชื่อมตอ โดยดึง URL มาจาก Environment Variable ของ Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const port = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // สไตล์หลักที่ใช้ร่วมกันทั้งหน้า - ธีมสีน้ำเงินเข้ม/ม่วง คล้ายท้องฟ้ายามค่ำคืน
  const styleBlock = `
    <style>
      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: 'Segoe UI', 'Sarabun', Tahoma, sans-serif;
        /* พื้นหลังไล่โทนน้ำเงินเข้ม-ม่วง เหมือนท้องฟ้ายามค่ำคืนมีเมฆ */
        background:
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06) 0%, transparent 40%),
          radial-gradient(circle at 80% 15%, rgba(255,255,255,0.05) 0%, transparent 35%),
          radial-gradient(circle at 50% 80%, rgba(120,80,200,0.25) 0%, transparent 55%),
          linear-gradient(160deg, #0b0f2b 0%, #1b1042 35%, #2d1b5e 60%, #14102e 100%);
        background-attachment: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
      }

      .container {
        background: rgba(15, 12, 40, 0.65);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(180, 160, 255, 0.25);
        border-radius: 22px;
        padding: 40px;
        box-shadow:
          0 20px 60px rgba(0, 0, 0, 0.55),
          0 0 40px rgba(120, 90, 220, 0.25) inset;
        max-width: 800px;
        width: 100%;
        animation: fadeIn 0.6s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      h1 {
        text-align: center;
        color: #e6e0ff;
        margin-bottom: 30px;
        font-size: 1.8em;
        text-shadow: 0 0 18px rgba(150, 120, 255, 0.6);
        letter-spacing: 0.5px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.35);
      }

      th {
        background: linear-gradient(135deg, #4c3b9e, #7c3aed);
        color: #f5f3ff;
        padding: 14px 16px;
        text-align: left;
        font-size: 0.95em;
        letter-spacing: 0.3px;
      }

      td {
        padding: 12px 16px;
        border-bottom: 1px solid rgba(180, 160, 255, 0.15);
        color: #e5e1ff;
        background: rgba(255, 255, 255, 0.02);
      }

      tr:nth-child(even) td { background: rgba(124, 58, 237, 0.08); }

      tr:hover td {
        background: rgba(124, 58, 237, 0.25);
        transition: background 0.25s ease;
      }

      .error-box {
        text-align: center;
        color: #ffb4b4;
      }
      .error-box h1 { color: #ff6b6b; text-shadow: 0 0 18px rgba(255,107,107,0.5); }
      .error-box p {
        background: rgba(255, 80, 80, 0.12);
        border: 1px solid rgba(255, 100, 100, 0.3);
        padding: 12px;
        border-radius: 10px;
        font-family: monospace;
        color: #ffd6d6;
      }

      .empty {
        text-align: center;
        color: #b3a8e0;
        padding: 20px;
      }
    </style>
  `;

  try {
    // 3. ขอเชื่อมตอและสงคําสั่ง SQL ไปดึงขอมูลจากตาราง students
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM students');
    client.release(); // คนืการเชื่อมตอเมื่อใชงานเสร็จ

    // 4. นําขอมูลที่ได(result.rows) มาประกอบเปนตาราง HTML
    let rowsHtml = '';
    if (result.rows.length === 0) {
      rowsHtml = `<tr><td colspan="2" class="empty">ยังไม่มีข้อมูลนักศึกษา</td></tr>`;
    } else {
      result.rows.forEach(row => {
        rowsHtml += `<tr><td>${row.student_id}</td><td>${row.student_name}</td></tr>`;
      });
    }

    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>ฐานข้อมูลนักศึกษา</title>
        ${styleBlock}
      </head>
      <body>
        <div class="container">
          <h1>🎓 ฐานข้อมูลนักศึกษา (ทดสอบการเชื่อมต่อ)</h1>
          <table>
            <tr><th>รหัสนักศึกษา</th><th>ชื่อ-นามสกุล</th></tr>
            ${rowsHtml}
          </table>
        </div>
      </body>
      </html>
    `;
    res.end(html);
  } catch (err) {
    // กรณเีชื่อมตอไมไดหรือเขียนชื่อตารางผิด
    console.error(err);
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>เกิดข้อผิดพลาด</title>
        ${styleBlock}
      </head>
      <body>
        <div class="container error-box">
          <h1>⚠️ เกิดข้อผิดพลาด!</h1>
          <p>${err.message}</p>
        </div>
      </body>
      </html>
    `;
    res.end(errorHtml);
  }
});

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
