const profile = [
  { key: "name", value: "จิรพล วสุคงสิน" },
  { key: "student_id", value: "69319011103" },
  { key: "status", value: "กำลังพัฒนาโปรเจกต์ส่งอาจารย์" },
  { key: "note", value: "// พื้นที่ด้านล่างเปิดไว้ให้ AI หรือทีมเติมโค้ดเพิ่มได้" },
];

const screen = document.getElementById("screen");

function renderLine(item) {
  const div = document.createElement("div");
  div.className = "line";
  if (item.key === "note") {
    div.innerHTML = `<span class="comment">${item.value}</span>`;
  } else {
    div.innerHTML = `<span class="key">${item.key}:</span> <span class="val"></span>`;
  }
  screen.appendChild(div);
  return div;
}

async function typeText(el, text, speed = 22) {
  for (let i = 0; i < text.length; i++) {
    el.textContent += text[i];
    await new Promise((r) => setTimeout(r, speed));
  }
}

async function boot() {
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  screen.appendChild(cursor);

  for (const item of profile) {
    cursor.remove();
    const line = renderLine(item);
    if (item.key !== "note") {
      const valEl = line.querySelector(".val");
      await typeText(valEl, item.value);
    }
    screen.appendChild(cursor);
    await new Promise((r) => setTimeout(r, 180));
  }
}

boot();
