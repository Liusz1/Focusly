document.addEventListener("DOMContentLoaded", () => {
  updateClock(); // Ganti updateGreeting dengan updateClock agar sesuai index.html
  updateStats(); // Ganti loadQuickStats dengan updateStats agar saldo & persen muncul
  setRandomQuote();
  loadProfile(); // Tambahkan ini agar nama & foto muncul

  // Update jam setiap detik
  setInterval(updateClock, 1000);
  // Cek deadline setiap 10 detik
  setInterval(checkDeadlinesHome, 10000);
});

// --- 1. LOGIKA PROFIL (YANG KURANG TADI) ---
function loadProfile() {
  const savedName = localStorage.getItem("userName") || "User";
  const savedAvatar =
    localStorage.getItem("userAvatar") || "https://via.placeholder.com/150";

  // Update foto di footer (nav-avatar) dan foto besar di modal
  const navAvatar = document.getElementById("nav-avatar");
  const largeAvatar = document.getElementById("user-avatar-large");
  const nameInput = document.getElementById("user-name-input");

  if (navAvatar) navAvatar.src = savedAvatar;
  if (largeAvatar) largeAvatar.src = savedAvatar;
  if (nameInput) nameInput.value = savedName;
}

function toggleProfileModal() {
  const modal = document.getElementById("profile-modal");
  if (modal) {
    modal.style.display = modal.style.display === "flex" ? "none" : "flex";
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64Image = e.target.result;
      document.getElementById("user-avatar-large").src = base64Image;
      document.getElementById("nav-avatar").src = base64Image;
      localStorage.setItem("userAvatar", base64Image);
    };
    reader.readAsDataURL(file);
  }
}

function saveProfile() {
  const name = document.getElementById("user-name-input").value;
  if (name.trim() !== "") {
    localStorage.setItem("userName", name);
    toggleProfileModal();
    alert("Profil diperbarui!");
  } else {
    alert("Nama tidak boleh kosong!");
  }
}

// --- 2. LOGIKA JAM & TANGGAL ---
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");

  const clockElement = document.getElementById("digital-clock");
  if (clockElement) clockElement.textContent = `${h}:${m}`;

  const opt = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateElement = document.getElementById("current-date");
  if (dateElement)
    dateElement.textContent = now.toLocaleDateString("id-ID", opt);
}

// --- 3. LOGIKA STATISTIK (SINKRON KE SEMUA HALAMAN) ---
function updateStats() {
  // To-Do Stats
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  const total = todos.length;
  const done = todos.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  if (document.getElementById("stat-todo"))
    document.getElementById("stat-todo").innerText = percent + "%";

  // Finance Stats
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let balance = 0;
  transactions.forEach((t) => {
    if (t.type === "income") balance += t.amount;
    else balance -= t.amount;
  });
  let formattedBalance =
    balance >= 1000000
      ? (balance / 1000000).toFixed(1) + "jt"
      : balance >= 1000
      ? (balance / 1000).toFixed(0) + "k"
      : balance;
  if (document.getElementById("stat-money"))
    document.getElementById("stat-money").innerText = "Rp " + formattedBalance;

  // Schedule Stats
  const schedules = JSON.parse(localStorage.getItem("schedules")) || [];
  const hariIndo = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const today = hariIndo[new Date().getDay()];
  const todayClass = schedules.filter((s) => s.day === today).length;
  if (document.getElementById("stat-schedule"))
    document.getElementById("stat-schedule").innerText = todayClass;
}

// --- 4. LOGIKA QUOTES ---
const quotes = [
  {
    text: "Jangan berhenti ketika lelah. Berhentilah ketika selesai.",
    author: "Anonim",
  },
  {
    text: "Masa depan adalah milik mereka yang percaya pada mimpi.",
    author: "Eleanor Roosevelt",
  },
  {
    text: "Pendidikan adalah senjata paling mematikan.",
    author: "Nelson Mandela",
  },
];

function setRandomQuote() {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  const qText = document.getElementById("quote-text");
  const qAuthor = document.getElementById("quote-author");
  if (qText) qText.textContent = `"${random.text}"`;
  if (qAuthor) qAuthor.textContent = `— ${random.author}`;
}

// --- 5. ALARM CHECKER ---
function checkDeadlinesHome() {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  const now = new Date().getTime();
  let updated = false;

  todos.forEach((todo) => {
    if (!todo.completed && todo.deadline && !todo.alarmPlayed) {
      if (now >= new Date(todo.deadline).getTime()) {
        const sound = document.getElementById("alarm-sound");
        if (sound) sound.play().catch(() => {});
        alert("🔔 DEADLINE: " + todo.task);
        todo.alarmPlayed = true;
        updated = true;
      }
    }
  });
  if (updated) {
    localStorage.setItem("todos", JSON.stringify(todos));
    updateStats();
  }
}
