let todos = JSON.parse(localStorage.getItem("todos")) || [];

const inputTask = document.getElementById("todo-input");
const inputDeadline = document.getElementById("todo-deadline");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const alarmSound = document.getElementById("alarm-sound");

// --- 1. IZIN & INISIALISASI ---
function requestPermission() {
  if ("Notification" in window) {
    Notification.requestPermission();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderTodos();
  requestPermission();
  // Cek setiap 10 detik agar lebih presisi
  setInterval(checkDeadlines, 10000);
});

// Trick Android: Audio akan 'terbuka' saat user berinteraksi
document.body.addEventListener(
  "click",
  () => {
    if (alarmSound) {
      // Hanya memancing izin, tidak memutar lagu dulu
      alarmSound.load();
    }
  },
  { once: true }
);

// --- 2. TAMBAH TUGAS ---
addBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const taskText = inputTask.value.trim();
  const deadlineValue = inputDeadline.value;

  if (!taskText) {
    inputTask.classList.add("error-shake");
    setTimeout(() => inputTask.classList.remove("error-shake"), 500);
    return;
  }

  const newTodo = {
    id: Date.now(),
    task: taskText,
    deadline: deadlineValue,
    completed: false,
    alarmPlayed: false,
  };

  todos.push(newTodo);
  saveAndRender();

  inputTask.value = "";
  inputDeadline.value = "";
  inputTask.blur();
});

function saveAndRender() {
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTodos();
}

function renderTodos() {
  todoList.innerHTML = "";
  let pendingCount = 0;

  // Sortir: Tugas selesai pindah ke bawah
  todos.sort((a, b) => a.completed - b.completed);

  todos.forEach((todo) => {
    if (!todo.completed) pendingCount++;
    const div = document.createElement("div");
    div.className = `task-item ${todo.completed ? "completed" : ""}`;
    div.innerHTML = `
            <div class="check-btn" onclick="toggleTodo(${todo.id})">
                ${
                  todo.completed
                    ? '<i class="fas fa-check" style="font-size: 10px; color:white;"></i>'
                    : ""
                }
            </div>
            <div class="task-content">
                <h4>${todo.task}</h4>
                <p><i class="far fa-clock"></i> ${
                  todo.deadline ? formatTime(todo.deadline) : "Gak ada deadline"
                }</p>
            </div>
            <i class="fas fa-trash-alt delete-btn" onclick="deleteTodo(${
              todo.id
            })"></i>
        `;
    todoList.appendChild(div);
  });
  document.getElementById(
    "pending-count"
  ).innerText = `${pendingCount} Tugas Aktif`;
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

window.toggleTodo = (id) => {
  todos = todos.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveAndRender();
};

window.deleteTodo = (id) => {
  if (confirm("Hapus tugas ini?")) {
    todos = todos.filter((t) => t.id !== id);
    saveAndRender();
  }
};

// --- 3. LOGIKA NOTIFIKASI & SUARA ---
function checkDeadlines() {
  const now = new Date();
  // Ambil waktu sekarang tanpa detik
  const currentCheck = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes()
  ).getTime();

  todos.forEach((todo) => {
    if (!todo.completed && todo.deadline && !todo.alarmPlayed) {
      const taskDeadline = new Date(todo.deadline).getTime();

      if (currentCheck >= taskDeadline) {
        playAlarm(todo.task);
        todo.alarmPlayed = true;
        saveAndRender();
      }
    }
  });
}

function playAlarm(taskName) {
  const alarmSound = document.getElementById("alarm-sound");

  if (alarmSound) {
    // 1. Paksa browser memuat ulang file
    alarmSound.load();
    alarmSound.currentTime = 0;
    alarmSound.volume = 1.0;

    // 2. Putar dengan penanganan error yang jelas
    let playPromise = alarmSound.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Lagu berhasil diputar!");
        })
        .catch((error) => {
          console.log("Gagal putar lagu karena: ", error);
          // Jika gagal karena belum klik, suara akan dicoba lagi saat user klik 'OK' di alert
        });
    }
  }

  // 3. Notifikasi Browser
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Personal OS: Waktunya!", {
      body: `Tugas: ${taskName}`,
      requireInteraction: true,
    });
  }

  // 4. Alert sebagai 'Trigger' Terakhir
  // Di Android, Alert seringkali 'membangunkan' audio yang terblokir
  setTimeout(() => {
    alert(`🔔 WAKTUNYA: ${taskName}`);
    // Matikan lagu setelah user klik OK agar tidak berisik terus
    if (alarmSound) alarmSound.pause();
  }, 500);
}
