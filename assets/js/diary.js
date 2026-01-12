let diaries = JSON.parse(localStorage.getItem("diaries")) || [];
let selectedMood = "😊";
let editId = null;

// KONFIGURASI PIN (Ganti di sini bro)
const MY_SECRET_PIN = "1234";

const modal = document.getElementById("diary-modal");
const pinModal = document.getElementById("pin-modal");
const pinInput = document.getElementById("pin-input");
const unlockBtn = document.getElementById("unlock-btn");
const diaryInput = document.getElementById("diary-input");
const diaryList = document.getElementById("diary-list");
const saveBtn = document.getElementById("save-diary-btn");

// --- 1. LOGIKA KEAMANAN PIN ---
unlockBtn.onclick = () => {
  if (pinInput.value === MY_SECRET_PIN) {
    pinModal.style.display = "none";
    renderDiaries(); // Baru tampilkan list setelah PIN benar
  } else {
    alert("PIN Salah! Coba lagi.");
    pinInput.value = "";
    pinInput.focus();
  }
};

// --- 2. MODAL CONTROL ---
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

// --- 3. MOOD SELECTOR ---
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

// --- 4. SAVE LOGIC ---
saveBtn.onclick = () => {
  const text = diaryInput.value.trim();
  if (!text) return;

  if (editId) {
    diaries = diaries.map((d) =>
      d.id === editId
        ? {
            ...d,
            content: text,
            mood: selectedMood,
          }
        : d
    );
  } else {
    const newDiary = {
      id: Date.now(),
      date: new Date().toLocaleString("id-ID", {
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

// --- 5. RENDER LIST ---
function renderDiaries() {
  diaryList.innerHTML = "";

  if (diaries.length === 0) {
    diaryList.innerHTML = `<p style="text-align:center; color:#94a3b8; margin-top:50px;">Belum ada cerita hari ini...</p>`;
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
};

// Inisialisasi awal (Jangan panggil renderDiaries di sini agar terkunci)
updateMoodUI();
