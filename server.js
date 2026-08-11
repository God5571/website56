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

  // สไตล์หลักที่ใช้ร่วมกันทั้งหน้า - ธีมสีน้ำเงินเข้ม/ม่วง พร้อมเอฟเฟกต์เคลื่อนไหว
  const styleBlock = `
    <style>
      * { box-sizing: border-box; }

      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&family=Poppins:wght@600;700&display=swap');

      body {
        margin: 0;
        min-height: 100vh;
        font-family: 'Sarabun', 'Segoe UI', Tahoma, sans-serif;
        position: relative;
        overflow-x: hidden;
        background:
          radial-gradient(circle at 50% 80%, rgba(120,80,200,0.25) 0%, transparent 55%),
          linear-gradient(160deg, #0b0f2b 0%, #1b1042 35%, #2d1b5e 60%, #14102e 100%);
        background-attachment: fixed;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
      }

      /* วงแสงลอยไหวเบาๆ ให้พื้นหลังมีชีวิตชีวา */
      .orb {
        position: fixed;
        border-radius: 50%;
        filter: blur(60px);
        opacity: 0.55;
        z-index: 0;
        animation: float 12s ease-in-out infinite;
      }
      .orb1 { width: 320px; height: 320px; background: #7c3aed; top: -80px; left: -80px; animation-delay: 0s; }
      .orb2 { width: 260px; height: 260px; background: #4f46e5; bottom: -60px; right: -60px; animation-delay: 3s; }
      .orb3 { width: 200px; height: 200px; background: #c026d3; top: 40%; right: 10%; animation-delay: 6s; opacity: 0.35; }

      @keyframes float {
        0%, 100% { transform: translateY(0) translateX(0) scale(1); }
        50% { transform: translateY(-30px) translateX(20px) scale(1.08); }
      }

      /* ดาวกระพริบเล็กๆ */
      .stars {
        position: fixed;
        inset: 0;
        z-index: 0;
        background-image:
          radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.7) 0%, transparent 100%),
          radial-gradient(2px 2px at 70% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 85% 60%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 30% 80%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(2px 2px at 55% 45%, rgba(255,255,255,0.4) 0%, transparent 100%);
        animation: twinkle 4s ease-in-out infinite alternate;
      }
      @keyframes twinkle {
        from { opacity: 0.4; }
        to { opacity: 1; }
      }

      .container {
        position: relative;
        z-index: 1;
        background: rgba(15, 12, 40, 0.6);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(180, 160, 255, 0.25);
        border-radius: 24px;
        padding: 44px;
        box-shadow:
          0 25px 70px rgba(0, 0, 0, 0.55),
          0 0 50px rgba(124, 58, 237, 0.25) inset;
        max-width: 800px;
        width: 100%;
        animation: fadeIn 0.7s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }

      h1 {
        text-align: center;
        font-family: 'Poppins', 'Sarabun', sans-serif;
        margin: 0 0 8px;
        font-size: 1.9em;
        background: linear-gradient(90deg, #c4b5fd, #a78bfa, #f0abfc, #c4b5fd);
        background-size: 300% auto;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: shine 6s linear infinite;
        letter-spacing: 0.5px;
      }
      @keyframes shine {
        to { background-position: 300% center; }
      }

      .subtitle {
        text-align: center;
        color: #b3a8e0;
        font-size: 0.9em;
        margin-bottom: 28px;
        letter-spacing: 0.3px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 8px 25px rgba(0,0,0,0.35);
      }

      th {
        background: linear-gradient(135deg, #4c3b9e, #7c3aed, #a21caf);
        background-size: 200% auto;
        color: #f5f3ff;
        padding: 15px 18px;
        text-align: left;
        font-size: 0.95em;
        letter-spacing: 0.4px;
        font-weight: 600;
      }

      td {
        padding: 13px 18px;
        border-bottom: 1px solid rgba(180, 160, 255, 0.15);
        color: #e5e1ff;
        background: rgba(255, 255, 255, 0.02);
        transition: background 0.25s ease, transform 0.2s ease;
      }

      tr:nth-child(even) td { background: rgba(124, 58, 237, 0.08); }

      tr:hover td {
        background: rgba(124, 58, 237, 0.28);
      }

      tbody tr {
        animation: rowIn 0.5s ease-out backwards;
      }
      tbody tr:nth-child(1) { animation-delay: 0.05s; }
      tbody tr:nth-child(2) { animation-delay: 0.1s; }
      tbody tr:nth-child(3) { animation-delay: 0.15s; }
      tbody tr:nth-child(4) { animation-delay: 0.2s; }
      tbody tr:nth-child(5) { animation-delay: 0.25s; }
      @keyframes rowIn {
        from { opacity: 0; transform: translateX(-8px); }
        to { opacity: 1; transform: translateX(0); }
      }

      .footer-note {
        text-align: center;
        margin-top: 24px;
        color: #8b7fb8;
        font-size: 0.8em;
      }

      .error-box {
        text-align: center;
        color: #ffb4b4;
      }
      .error-box h1 {
        background: linear-gradient(90deg, #ff8a8a, #ff5c5c);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: none;
      }
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
        padding: 24px;
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
        <div class="stars"></div>
        <div class="orb orb1"></div>
        <div class="orb orb2"></div>
        <div class="orb orb3"></div>
        <div class="container">
          <h1>🎓 ฐานข้อมูลนักศึกษา</h1>
          <p class="subtitle">ทดสอบการเชื่อมต่อฐานข้อมูล PostgreSQL ผ่าน Railway</p>
          <table>
            <tr><th>รหัสนักศึกษา</th><th>ชื่อ-นามสกุล</th></tr>
            ${rowsHtml}
          </table>
          <p class="footer-note">พัฒนาด้วย Node.js + PostgreSQL</p>
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
        <div class="stars"></div>
        <div class="orb orb1"></div>
        <div class="orb orb2"></div>
        <div class="orb orb3"></div>
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
