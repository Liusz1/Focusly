document.addEventListener("DOMContentLoaded", () => {
  // Inisialisasi Tampilan
  updateClock();
  updateStats();
  updateSmartWarnings();

  // Update jam setiap detik
  setInterval(updateClock, 1000);

  // Update info otomatis setiap 1 menit
  setInterval(() => {
    updateSmartWarnings();
    updateStats();
  }, 60000);

  // Close modal jika user klik di luar area konten (Overlay)
  const modal = document.getElementById("evalModal");
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeEvalModal();
    }
  });
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

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = days[now.getDay()];

  let html = "";

  // A. Deadline To-Do
  const pendingTodos = todos
    .filter((t) => !t.completed && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  if (pendingTodos.length > 0) {
    const priorityTask = pendingTodos[0];
    html += `
            <div class="warning-card danger" onclick="location.href='pages/todo.html'">
                <i class="fas fa-clipboard-list" style="color:#ef4444; font-size:1.4rem;"></i>
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
                }; font-size:1.4rem;"></i>
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
    html = `<div style="text-align:center; padding:30px; color:#94a3b8; font-size:0.85rem;">Tidak ada agenda mendesak.</div>`;
  }
  container.innerHTML = html;
}

// 2. STATS BANNER
function updateStats() {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  const done = todos.filter((t) => t.completed).length;
  const percent =
    todos.length === 0 ? 0 : Math.round((done / todos.length) * 100);
  const todoEl = document.getElementById("stat-todo");
  if (todoEl) todoEl.innerText = percent + "%";

  const trans = JSON.parse(localStorage.getItem("transactions")) || [];
  let bal = 0;
  trans.forEach((t) =>
    t.type === "income" ? (bal += t.amount) : (bal -= t.amount)
  );

  const moneyEl = document.getElementById("stat-money");
  if (moneyEl) {
    moneyEl.innerText =
      bal >= 1000000
        ? "Rp " + (bal / 1000000).toFixed(1) + "jt"
        : bal >= 1000
        ? "Rp " + (bal / 1000).toFixed(0) + "k"
        : "Rp " + bal;
  }

  const sch = JSON.parse(localStorage.getItem("schedules")) || [];
  const now = new Date();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = days[now.getDay()];
  const timeStr =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");

  const remaining = sch.filter(
    (s) => s.day === today && s.end > timeStr
  ).length;
  const schEl = document.getElementById("stat-schedule");
  if (schEl) schEl.innerText = remaining;
}

// 3. CLOCK & DATE
function updateClock() {
  const now = new Date();
  const clockEl = document.getElementById("digital-clock");
  const dateEl = document.getElementById("current-date");

  if (clockEl) {
    clockEl.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  }

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
}

// 4. MODAL HANDLERS (EVALUASI)
function openEvalModal() {
  const modal = document.getElementById("evalModal");
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // Kunci scroll agar tidak lari
  }
}

function closeEvalModal() {
  const modal = document.getElementById("evalModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

function submitEvaluation() {
  const namaInput = document.getElementById("evalName");
  const pesanInput = document.getElementById("evalMsg");
  const btn = document.getElementById("btnSubmitEval");
  const btnText = document.getElementById("btnText");

  const urlScript =
    "https://script.google.com/macros/s/AKfycbzc-zAnbTmXTJAqsvoWVC0reIt4SWWOOfzP6fMNVryJFq32SCY0uoEy9s4t_bDm-ywIRA/exec";

  if (!namaInput.value || !pesanInput.value) {
    return alert("Woi isi dulu namanya sama pesannya bro! 😂");
  }

  // Efek Loading
  if (btn) btn.disabled = true;
  if (btnText) btnText.innerText = "Mengirim...";

  // Gunakan FormData untuk compatibility lebih baik di HP lama
  const formData = new FormData();
  formData.append("nama", namaInput.value);
  formData.append("pesan", pesanInput.value);

  fetch(urlScript, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({ nama: namaInput.value, pesan: pesanInput.value }),
  })
    .then(() => {
      alert("Mantap! Masukan kamu sudah diterima. Thanks ya bro!");
      namaInput.value = "";
      pesanInput.value = "";
      closeEvalModal();
    })
    .catch((err) => {
      alert("Aduh gagal kirim, coba cek koneksi internetmu.");
      console.error(err);
    })
    .finally(() => {
      if (btn) btn.disabled = false;
      if (btnText) btnText.innerText = "Kirim Pesan";
    });
}

// 5. PROFILE & ABOUT
function toggleAbout() {
  alert(
    "LiusProject OS v1.0\nCreated with ❤️ for students.\n\nSelamat belajar!"
  );
}
