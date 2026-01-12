let schedules = JSON.parse(localStorage.getItem("schedules")) || [];

// 1. Ambil Hari Ini dalam Bahasa Indonesia
const hariIndo = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
const now = new Date();
const today = hariIndo[now.getDay()];
let activeDay = "";

function filterDay(day) {
  activeDay = day;
  document.querySelectorAll(".day-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.innerText === day);
  });
  renderSchedules();
}

function openModal() {
  document.getElementById("schedule-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("schedule-modal").style.display = "none";
}

document.getElementById("save-schedule-btn").onclick = () => {
  const name = document.getElementById("subject-name").value;
  const start = document.getElementById("start-time").value;
  const end = document.getElementById("end-time").value;
  const room = document.getElementById("room-name").value;
  const day = document.getElementById("day-select").value;

  if (!name || !start || !end) return alert("Harap isi nama dan jam!");

  schedules.push({ id: Date.now(), name, start, end, room, day });
  localStorage.setItem("schedules", JSON.stringify(schedules));

  document.getElementById("subject-name").value = "";
  document.getElementById("room-name").value = "";

  closeModal();
  filterDay(day);
};

function renderSchedules() {
  const list = document.getElementById("schedule-list");
  list.innerHTML = "";

  const filtered = schedules
    .filter((s) => s.day === activeDay)
    .sort((a, b) => a.start.localeCompare(b.start));

  if (filtered.length === 0) {
    list.innerHTML = `
            <div style="text-align:center; padding: 50px 20px;">
                <i class="fas fa-mug-hot" style="font-size: 3rem; color: #e2e8f0; margin-bottom: 15px;"></i>
                <p style="color:#94a3b8; font-weight:600;">Santai dulu, hari ${activeDay} gak ada jadwal.</p>
            </div>`;
    return;
  }

  // Ambil Waktu Sekarang (Format HH:mm)
  const timeNow = new Date();
  const currentTime = `${String(timeNow.getHours()).padStart(2, "0")}:${String(
    timeNow.getMinutes()
  ).padStart(2, "0")}`;

  filtered.forEach((s) => {
    // LOGIKA LIVE: Cek apakah hari ini cocok DAN waktu sekarang masuk range jadwal
    const isNow =
      today === activeDay && currentTime >= s.start && currentTime <= s.end;

    const card = document.createElement("div");
    card.className = `schedule-card ${isNow ? "now" : ""}`;

    // Tambahkan Badge "LIVE" kalau sedang berlangsung
    const liveBadge = isNow
      ? `<span style="background:#6366f1; color:#fff; font-size:0.6rem; padding:2px 8px; border-radius:10px; margin-left:8px; animation: pulse 1.5s infinite;">LIVE</span>`
      : "";

    card.innerHTML = `
            <div class="time-box">
                <strong style="${isNow ? "color:#6366f1" : ""}">${
      s.start
    }</strong>
                <span>s/d</span>
                <strong style="${isNow ? "color:#6366f1" : ""}">${
      s.end
    }</strong>
            </div>
            <div class="subject-info">
                <h4>${s.name} ${liveBadge}</h4>
                <p>
                    <i class="fas fa-location-dot" style="font-size: 0.7rem; color: ${
                      isNow ? "#6366f1" : "#94a3b8"
                    }"></i> 
                    ${s.room || "Tanpa Ruangan"}
                </p>
            </div>
            <button onclick="deleteSchedule(${
              s.id
            })" style="margin-left:auto; border:none; background:none; color:#cbd5e1; cursor:pointer; padding: 10px;">
                <i class="fas fa-times-circle"></i>
            </button>
        `;
    list.appendChild(card);
  });
}

window.deleteSchedule = (id) => {
  if (confirm("Hapus mata kuliah ini?")) {
    schedules = schedules.filter((s) => s.id !== id);
    localStorage.setItem("schedules", JSON.stringify(schedules));
    renderSchedules();
  }
};

// 2. Jalankan Otomatis Hari Ini (Jika Minggu, arahkan ke Senin)
filterDay(today === "Minggu" ? "Senin" : today);

// 3. Auto Refresh setiap 1 menit biar status "LIVE" berubah sendiri
setInterval(() => {
  renderSchedules();
}, 60000);
