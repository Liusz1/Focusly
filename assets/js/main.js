document.addEventListener("DOMContentLoaded", () => {
  // Jalankan fungsi inisialisasi
  updateClock();
  updateStats();
  loadProfile();
  updateSmartWarnings();

  // Interval update jam (setiap detik)
  setInterval(updateClock, 1000);

  // Interval update dashboard & statistik (setiap menit)
  setInterval(() => {
    updateSmartWarnings();
    updateStats();
  }, 60000);
});

// --- 1. LOGIKA SMART WARNINGS (DASHBOARD INTERAKTIF) ---
function updateSmartWarnings() {
  const container = document.getElementById("warning-container");
  if (!container) return;

  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  const schedules = JSON.parse(localStorage.getItem("schedules")) || [];

  const now = new Date();
  const currentTime =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");
  const hariIndo = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const today = hariIndo[now.getDay()];

  let html = "";

  // A. KARTU DEADLINE TUGAS (Navigasi ke To-Do)
  // Filter tugas: belum selesai dan memiliki deadline
  const pendingTodos = todos.filter((t) => !t.completed && t.deadline);
  // Urutkan dari yang paling mendekati waktu sekarang
  pendingTodos.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  if (pendingTodos.length > 0) {
    const priorityTask = pendingTodos[0];
    const deadlineDate = new Date(priorityTask.deadline);
    const isToday = deadlineDate.toDateString() === now.toDateString();
    const timeLabel = isToday
      ? `Hari Ini pukul ${String(deadlineDate.getHours()).padStart(
          2,
          "0"
        )}:${String(deadlineDate.getMinutes()).padStart(2, "0")}`
      : priorityTask.deadline.split("T")[0];

    html += `
            <div class="warning-card danger" onclick="location.href='pages/todo.html'" style="cursor:pointer; position:relative;">
                <i class="fas fa-clipboard-list" style="color:#ef4444; font-size:1.2rem;"></i>
                <div class="warning-info">
                    <h4>Deadline Terdekat</h4>
                    <p>Tugas: <strong>${priorityTask.task}</strong></p>
                    <p style="font-size: 0.75rem; color: #ef4444; font-weight: bold;">⏳ ${timeLabel}</p>
                </div>
                <i class="fas fa-chevron-right" style="margin-left:auto; color:#cbd5e1; font-size:0.8rem;"></i>
            </div>`;
  }

  // B. KARTU JADWAL KULIAH (Navigasi ke Jadwal)
  // Filter jadwal: hari ini dan belum selesai (jam selesai > jam sekarang)
  const todayClasses = schedules.filter(
    (s) => s.day === today && s.end > currentTime
  );
  // Urutkan berdasarkan jam mulai paling awal
  todayClasses.sort((a, b) => a.start.localeCompare(b.start));

  if (todayClasses.length > 0) {
    const nextClass = todayClasses[0]; // Hanya ambil satu jadwal terdekat
    const isNow =
      currentTime >= nextClass.start && currentTime <= nextClass.end;
    const statusTitle = isNow
      ? "Sedang Berlangsung"
      : `Jadwal Berikutnya: ${nextClass.start}`;
    const accentColor = isNow ? "#10b981" : "#6366f1"; // Hijau jika LIVE, Biru jika akan datang

    html += `
            <div class="warning-card" onclick="location.href='pages/jadwal.html'" style="border-left-color: ${accentColor}; cursor:pointer; position:relative;">
                <i class="fas fa-university" style="color:${accentColor}; font-size:1.2rem;"></i>
                <div class="warning-info">
                    <h4>${statusTitle}</h4>
                    <p>Mata Kuliah: <strong>${nextClass.name}</strong></p>
                    <p style="font-size: 0.75rem; color: #94a3b8;">
                        <i class="fas fa-location-dot"></i> ${
                          nextClass.room || "Tanpa Ruangan"
                        }
                    </p>
                </div>
                <i class="fas fa-chevron-right" style="margin-left:auto; color:#cbd5e1; font-size:0.8rem;"></i>
            </div>`;
  }

  // Jika tidak ada tugas atau jadwal mendesak
  if (html === "") {
    html = `
            <div style="text-align: center; padding: 25px; color: #94a3b8; font-size: 0.85rem; background:white; border-radius:20px;">
                <i class="fas fa-check-double" style="display:block; font-size: 1.5rem; margin-bottom: 8px; color: #cbd5e1;"></i>
                Tidak ada agenda mendesak hari ini.
            </div>`;
  }

  container.innerHTML = html;
}

// --- 2. LOGIKA STATISTIK (BANNER ATAS) ---
function updateStats() {
  // Statistik Tugas
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  const done = todos.filter((t) => t.completed).length;
  const percent =
    todos.length === 0 ? 0 : Math.round((done / todos.length) * 100);
  if (document.getElementById("stat-todo"))
    document.getElementById("stat-todo").innerText = percent + "%";

  // Statistik Saldo
  const trans = JSON.parse(localStorage.getItem("transactions")) || [];
  let bal = 0;
  trans.forEach((t) =>
    t.type === "income" ? (bal += t.amount) : (bal -= t.amount)
  );
  if (document.getElementById("stat-money")) {
    document.getElementById("stat-money").innerText =
      "Rp " + (bal >= 1000 ? (bal / 1000).toFixed(0) + "k" : bal);
  }

  // Statistik Jadwal (Menghitung jadwal tersisa hari ini)
  const sch = JSON.parse(localStorage.getItem("schedules")) || [];
  const now = new Date();
  const currentTime =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");
  const today = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ][now.getDay()];
  const remainingToday = sch.filter(
    (s) => s.day === today && s.end > currentTime
  ).length;
  if (document.getElementById("stat-schedule"))
    document.getElementById("stat-schedule").innerText = remainingToday;
}

// --- 3. LOGIKA JAM & TANGGAL ---
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  if (document.getElementById("digital-clock"))
    document.getElementById("digital-clock").textContent = `${h}:${m}`;

  const opt = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  if (document.getElementById("current-date")) {
    document.getElementById("current-date").textContent =
      now.toLocaleDateString("id-ID", opt);
  }
}

// --- 4. LOGIKA PROFIL & MODAL ---
function loadProfile() {
  const name = localStorage.getItem("userName") || "User";
  const avatar =
    localStorage.getItem("userAvatar") || "https://via.placeholder.com/150";
  if (document.getElementById("nav-avatar"))
    document.getElementById("nav-avatar").src = avatar;
  if (document.getElementById("user-avatar-large"))
    document.getElementById("user-avatar-large").src = avatar;
  if (document.getElementById("user-name-input"))
    document.getElementById("user-name-input").value = name;
}

function toggleProfileModal() {
  const m = document.getElementById("profile-modal");
  if (m) m.style.display = m.style.display === "flex" ? "none" : "flex";
}

function saveProfile() {
  const name = document.getElementById("user-name-input").value;
  if (name) {
    localStorage.setItem("userName", name);
    toggleProfileModal();
    loadProfile();
  }
}

function toggleAbout() {
  const modal = document.getElementById("about-modal");
  if (modal.style.display === "flex") {
    modal.style.display = "none";
  } else {
    modal.style.display = "flex";
  }
}
