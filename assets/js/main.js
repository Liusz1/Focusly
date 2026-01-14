document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  updateStats();
  updateSmartWarnings();

  setInterval(updateClock, 1000);
  setInterval(() => {
    updateSmartWarnings();
    updateStats();
  }, 60000);
});

// 1. SMART WARNINGS (DASHBOARD)
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
  const today = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ][now.getDay()];

  let html = "";

  // A. Deadline To-Do
  const pendingTodos = todos
    .filter((t) => !t.completed && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  if (pendingTodos.length > 0) {
    const priorityTask = pendingTodos[0];
    html += `
            <div class="warning-card danger" onclick="location.href='pages/todo.html'">
                <i class="fas fa-clipboard-list" style="color:#ef4444; font-size:1.2rem;"></i>
                <div class="warning-info">
                    <h4>Deadline Terdekat</h4>
                    <p><strong>${priorityTask.task}</strong></p>
                    <p style="font-size:0.75rem; color:#ef4444;">⏳ Segera Selesaikan!</p>
                </div>
            </div>`;
  }

  // B. Jadwal Kuliah Hari Ini
  const todayClasses = schedules
    .filter((s) => s.day === today && s.end > currentTime)
    .sort((a, b) => a.start.localeCompare(b.start));

  if (todayClasses.length > 0) {
    const nextClass = todayClasses[0];
    const isNow =
      currentTime >= nextClass.start && currentTime <= nextClass.end;
    html += `
            <div class="warning-card" onclick="location.href='pages/jadwal.html'" style="border-left-color: ${
              isNow ? "#10b981" : "#6366f1"
            }">
                <i class="fas fa-university" style="color:${
                  isNow ? "#10b981" : "#6366f1"
                }; font-size:1.2rem;"></i>
                <div class="warning-info">
                    <h4>${isNow ? "Sedang Kuliah" : "Jadwal Berikutnya"}</h4>
                    <p><strong>${nextClass.name}</strong></p>
                    <p style="font-size:0.75rem;">📍 ${
                      nextClass.room || "Online"
                    }</p>
                </div>
            </div>`;
  }

  if (html === "") {
    html = `<div style="text-align:center; padding:20px; color:#94a3b8; font-size:0.85rem;">Tidak ada agenda mendesak.</div>`;
  }
  container.innerHTML = html;
}

// 2. STATS BANNER
function updateStats() {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  const done = todos.filter((t) => t.completed).length;
  const percent =
    todos.length === 0 ? 0 : Math.round((done / todos.length) * 100);
  if (document.getElementById("stat-todo"))
    document.getElementById("stat-todo").innerText = percent + "%";

  const trans = JSON.parse(localStorage.getItem("transactions")) || [];
  let bal = 0;
  trans.forEach((t) =>
    t.type === "income" ? (bal += t.amount) : (bal -= t.amount)
  );
  if (document.getElementById("stat-money")) {
    document.getElementById("stat-money").innerText =
      "Rp " + (bal >= 1000 ? (bal / 1000).toFixed(0) + "k" : bal);
  }

  const sch = JSON.parse(localStorage.getItem("schedules")) || [];
  const now = new Date();
  const today = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ][now.getDay()];
  const remaining = sch.filter(
    (s) =>
      s.day === today &&
      s.end >
        String(now.getHours()).padStart(2, "0") +
          ":" +
          String(now.getMinutes()).padStart(2, "0")
  ).length;
  if (document.getElementById("stat-schedule"))
    document.getElementById("stat-schedule").innerText = remaining;
}

// 3. CLOCK & DATE
function updateClock() {
  const now = new Date();
  if (document.getElementById("digital-clock"))
    document.getElementById("digital-clock").textContent = `${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  if (document.getElementById("current-date"))
    document.getElementById("current-date").textContent =
      now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

// 4. ABOUT MODAL
function toggleAbout() {
  const m = document.getElementById("about-modal");
  m.style.display = m.style.display === "flex" ? "none" : "flex";
}

function saveProfileData() {
  const user = document.getElementById("username-input").value;
  localStorage.setItem("username", user);
  alert("Profil berhasil diperbarui!");
}
