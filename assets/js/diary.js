let diaries = JSON.parse(localStorage.getItem("diaries")) || [];
let selectedMood = "😊";
let editId = null;

const MY_SECRET_PIN = "1234";

const modal = document.getElementById("diary-modal");
const statsModal = document.getElementById("stats-modal");
const pinModal = document.getElementById("pin-modal");
const pinInput = document.getElementById("pin-input");
const unlockBtn = document.getElementById("unlock-btn");
const diaryInput = document.getElementById("diary-input");
const diaryList = document.getElementById("diary-list");
const saveBtn = document.getElementById("save-diary-btn");

// --- 1. MOOD TRACKER LOGIC (PERBAIKAN TOTAL) ---
function renderMoodTracker() {
  const grid = document.getElementById("mood-calendar-grid");
  const insightText = document.getElementById("mood-insight-text");
  if (!grid) return;

  grid.innerHTML = "";
  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();

  const moodMap = {
    "😊": "dot-happy",
    "🤩": "dot-excited",
    "😔": "dot-sad",
    "😡": "dot-angry",
  };

  let moodCounts = { "😊": 0, "🤩": 0, "😔": 0, "😡": 0 };
  let trackedDays = 0;

  for (let i = 1; i <= daysInMonth; i++) {
    const dot = document.createElement("div");
    dot.className = "mood-dot";

    // Cek apakah ada jurnal di tanggal ini yang punya rawDate
    const entry = diaries.find((d) => {
      if (!d.rawDate) return false;
      const dDate = new Date(d.rawDate);
      return (
        dDate.getDate() === i &&
        dDate.getMonth() === now.getMonth() &&
        dDate.getFullYear() === now.getFullYear()
      );
    });

    if (entry) {
      dot.classList.add(moodMap[entry.mood]);
      moodCounts[entry.mood]++;
      trackedDays++;
    }
    grid.appendChild(dot);
  }

  // --- LOGIKA INSIGHT YANG LEBIH CERDAS ---
  if (trackedDays > 0) {
    const maxCount = Math.max(...Object.values(moodCounts));
    const topMoods = Object.keys(moodCounts).filter(
      (m) => moodCounts[m] === maxCount
    );

    if (topMoods.length > 1) {
      // Jika jumlah mood yang paling banyak ada lebih dari satu (Seri)
      insightText.innerText = "Bulan ini perasaanmu campur aduk! 🎢";
    } else {
      // Jika benar-benar ada satu yang dominan
      insightText.innerText = `Bulan ini kamu dominan merasa ${topMoods[0]}`;
    }
  } else {
    insightText.innerText =
      "Belum ada data jurnal (Coba edit & simpan jurnal lama).";
  }
}

// --- 2. MODAL & UI CONTROL ---
function openStatsModal() {
  renderMoodTracker();
  statsModal.style.display = "flex";
}

function closeStatsModal() {
  statsModal.style.display = "none";
}

function openModal(id = null) {
  editId = id;
  if (id) {
    const item = diaries.find((d) => d.id === id);
    diaryInput.value = item.content;
    selectedMood = item.mood;
    document.getElementById("modal-title").innerText = "Edit Cerita";
  } else {
    diaryInput.value = "";
    selectedMood = "😊";
    document.getElementById("modal-title").innerText = "Cerita Baru";
  }
  updateMoodUI();
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
  editId = null;
}

function updateMoodUI() {
  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.mood === selectedMood);
  });
}

document.querySelectorAll(".mood-btn").forEach((btn) => {
  btn.onclick = () => {
    selectedMood = btn.dataset.mood;
    updateMoodUI();
  };
});

// --- 3. PIN & SAVE LOGIC ---
unlockBtn.onclick = () => {
  if (pinInput.value === MY_SECRET_PIN) {
    pinModal.style.display = "none";
    renderDiaries();
  } else {
    alert("PIN Salah!");
    pinInput.value = "";
  }
};

saveBtn.onclick = () => {
  const text = diaryInput.value.trim();
  if (!text) return;
  const now = new Date();

  if (editId) {
    diaries = diaries.map((d) =>
      d.id === editId
        ? {
            ...d,
            content: text,
            mood: selectedMood,
            rawDate: d.rawDate || now.toISOString(),
          }
        : d
    );
  } else {
    const newDiary = {
      id: Date.now(),
      rawDate: now.toISOString(),
      date: now.toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      mood: selectedMood,
      content: text,
    };
    diaries.unshift(newDiary);
  }

  localStorage.setItem("diaries", JSON.stringify(diaries));
  renderDiaries();
  closeModal();
};

// --- 4. RENDER LIST ---
function renderDiaries() {
  diaryList.innerHTML = "";
  if (diaries.length === 0) {
    diaryList.innerHTML = `<p style="text-align:center; color:#94a3b8; margin-top:50px;">Belum ada cerita...</p>`;
    return;
  }

  diaries.forEach((item) => {
    const div = document.createElement("div");
    div.className = "diary-item";
    div.innerHTML = `
      <div class="diary-header">
        <span class="diary-date">${item.date}</span>
        <span style="font-size:1.2rem">${item.mood}</span>
      </div>
      <p class="diary-text">${item.content}</p>
      <div class="diary-actions">
        <button class="btn-edit" onclick="openModal(${item.id})"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn-delete" onclick="deleteDiary(${item.id})"><i class="fas fa-trash"></i></button>
      </div>
    `;
    diaryList.appendChild(div);
  });
}

window.deleteDiary = (id) => {
  if (confirm("Hapus cerita ini?")) {
    diaries = diaries.filter((d) => d.id !== id);
    localStorage.setItem("diaries", JSON.stringify(diaries));
    renderDiaries();
  }
};

window.onclick = (e) => {
  if (e.target == modal) closeModal();
  if (e.target == statsModal) closeStatsModal();
};

updateMoodUI();
