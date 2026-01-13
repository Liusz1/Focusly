let schedules = JSON.parse(localStorage.getItem("schedules")) || [];
let editId = null;

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
// Inisialisasi activeDay dengan hari ini (atau Senin jika ini hari Minggu)
let activeDay = today === "Minggu" ? "Senin" : today;

// --- PERBAIKAN: Ekspos fungsi ke Window agar bisa dipanggil dari HTML ---

window.filterDay = function (day) {
  activeDay = day;
  document.querySelectorAll(".day-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.innerText === day);
  });
  renderSchedules();
};

window.openModal = function (isEdit = false, id = null) {
  const modal = document.getElementById("schedule-modal");
  const btnSave = document.getElementById("save-schedule-btn");
  const title = modal.querySelector("h2");

  if (isEdit && id) {
    editId = id;
    const data = schedules.find((s) => s.id === id);
    if (data) {
      document.getElementById("subject-name").value = data.name;
      document.getElementById("start-time").value = data.start;
      document.getElementById("end-time").value = data.end;
      document.getElementById("room-name").value = data.room;
      document.getElementById("day-select").value = data.day;
      btnSave.innerText = "UPDATE JADWAL";
      if (title) title.innerText = "Edit Agenda";
    }
  } else {
    editId = null;
    const form = document.getElementById("schedule-form");
    if (form) form.reset();
    document.getElementById("day-select").value = activeDay;
    btnSave.innerText = "TAMBAH JADWAL";
    if (title) title.innerText = "Tambah Agenda Baru";
  }
  modal.style.display = "flex";
};

window.closeModal = function () {
  document.getElementById("schedule-modal").style.display = "none";
  editId = null;
};

// --- Logika Simpan ---
document.getElementById("save-schedule-btn").onclick = () => {
  const name = document.getElementById("subject-name").value;
  const start = document.getElementById("start-time").value;
  const end = document.getElementById("end-time").value;
  const room = document.getElementById("room-name").value;
  const day = document.getElementById("day-select").value;

  if (!name || !start || !end) return alert("Harap isi nama dan jam!");

  if (editId) {
    const index = schedules.findIndex((s) => s.id === editId);
    if (index !== -1) {
      schedules[index] = { ...schedules[index], name, start, end, room, day };
    }
  } else {
    schedules.push({ id: Date.now(), name, start, end, room, day });
  }

  localStorage.setItem("schedules", JSON.stringify(schedules));
  window.closeModal();
  window.filterDay(day);
};

// --- Render Tampilan ---
function renderSchedules() {
  const list = document.getElementById("schedule-list");
  if (!list) return;
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

  const timeNow = new Date();
  const currentTime = `${String(timeNow.getHours()).padStart(2, "0")}:${String(
    timeNow.getMinutes()
  ).padStart(2, "0")}`;

  filtered.forEach((s) => {
    const isNow =
      today === activeDay && currentTime >= s.start && currentTime <= s.end;
    const card = document.createElement("div");
    card.className = `schedule-card ${isNow ? "now" : ""}`;
    card.style =
      "display: flex; align-items: center; padding: 15px; gap: 12px; margin-bottom: 12px; background: white; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);";

    const liveBadge = isNow
      ? `<span class="live-badge" style="background: #6366f1; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.6rem; margin-left: 5px;">LIVE</span>`
      : "";

    card.innerHTML = `
            <div class="time-box" style="flex-shrink: 0; min-width: 65px; text-align: center;">
                <strong style="${isNow ? "color:#6366f1" : "color:#1e293b"}">${
      s.start
    }</strong>
                <span style="font-size: 0.7rem; color: #cbd5e1; display: block;">s/d</span>
                <strong style="${isNow ? "color:#6366f1" : "color:#1e293b"}">${
      s.end
    }</strong>
            </div>
            <div class="subject-info" style="flex-grow: 1; min-width: 0;">
                <h4 style="margin: 0; font-size: 1rem; color: #1e293b; word-wrap: break-word;">${
                  s.name
                } ${liveBadge}</h4>
                <p style="margin: 4px 0 0; font-size: 0.8rem; color: #94a3b8;">
                    <i class="fas fa-location-dot"></i> ${
                      s.room || "Tanpa Lokasi"
                    }
                </p>
            </div>
            <div class="action-buttons" style="display: flex; flex-direction: column; gap: 8px;">
                <button onclick="openModal(true, ${
                  s.id
                })" style="border:none; background:#f1f5f9; color:#6366f1; border-radius: 8px; width: 32px; height: 32px; cursor:pointer;">
                    <i class="fas fa-pen-to-square"></i>
                </button>
                <button onclick="deleteSchedule(${
                  s.id
                })" style="border:none; background:#fff1f2; color:#ef4444; border-radius: 8px; width: 32px; height: 32px; cursor:pointer;">
                    <i class="fas fa-trash-can"></i>
                </button>
            </div>`;
    list.appendChild(card);
  });
}

window.deleteSchedule = (id) => {
  if (confirm("Hapus jadwal ini?")) {
    schedules = schedules.filter((s) => s.id !== id);
    localStorage.setItem("schedules", JSON.stringify(schedules));
    renderSchedules();
  }
};

 
// Inisialisasi awal
window.filterDay(activeDay);
setInterval(renderSchedules, 60000);
