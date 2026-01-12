let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let financeChart;

// --- MODAL & INPUT ---
function openMoneyModal(type) {
  window.currentType = type;
  document.getElementById("modal-title").innerText =
    type === "income" ? "Dana Masuk" : "Dana Keluar";
  document.getElementById("money-modal").style.display = "flex";
}

function closeMoneyModal() {
  document.getElementById("money-modal").style.display = "none";
  document.getElementById("amount-input").value = "";
  document.getElementById("desc-input").value = "";
}

document.getElementById("save-money-btn").onclick = () => {
  const amount = parseInt(document.getElementById("amount-input").value);
  const desc = document.getElementById("desc-input").value.trim();

  if (!amount || !desc) return alert("Mohon isi semua data!");

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

  // Simpan transaksi baru di urutan paling atas
  transactions.unshift({
    id: Date.now(),
    type: window.currentType,
    amount: amount,
    desc: desc,
    date: dateStr,
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderAll();
  closeMoneyModal();
};

// --- FITUR HAPUS ---
function deleteTransaction(id) {
  if (confirm("Hapus catatan ini?")) {
    transactions = transactions.filter((t) => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderAll();
  }
}

function clearAllTransactions() {
  if (transactions.length === 0) return alert("Riwayat sudah kosong!");
  if (confirm("Hapus semua riwayat transaksi? Data tidak bisa dikembalikan!")) {
    transactions = [];
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderAll();
  }
}

// --- STRUK & PNG ---
function showReceipt() {
  if (transactions.length === 0) return alert("Belum ada data transaksi!");
  const rItems = document.getElementById("r-items");
  document.getElementById("r-date").innerText = new Date().toLocaleString(
    "id-ID"
  );
  rItems.innerHTML = "";

  // Tampilkan 8 transaksi terakhir di struk
  transactions.slice(0, 8).forEach((t) => {
    const item = document.createElement("div");
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.marginBottom = "5px";
    const icon = t.type === "income" ? "▲" : "▼";
    item.innerHTML = `
            <div style="color: #000;">
                <span style="color:${
                  t.type === "income" ? "#16a34a" : "#dc2626"
                }; margin-right:5px;">${icon}</span>
                <span>${t.desc.toUpperCase()}</span>
            </div>
            <div style="color: #000;">${t.amount.toLocaleString()}</div>
        `;
    rItems.appendChild(item);
  });

  const total = transactions.reduce(
    (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
    0
  );
  document.getElementById("r-total").innerText = `Rp ${total.toLocaleString()}`;
  document.getElementById("receipt-modal").style.display = "flex";
}

function downloadReceiptPNG() {
  const area = document.getElementById("receipt-area");
  if (typeof html2canvas === "undefined")
    return alert("Library html2canvas belum terpasang!");

  html2canvas(area, { backgroundColor: "#ffffff", scale: 2 }).then((canvas) => {
    const link = document.createElement("a");
    link.download = `Struk-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

// --- RENDER & GRAFIK (FIXED) ---
function renderAll() {
  const list = document.getElementById("transaction-list");
  list.innerHTML = "";

  if (transactions.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding:40px; color:#94a3b8;"><i class="fas fa-wallet" style="font-size:2rem; opacity:0.2; margin-bottom:10px;"></i><p>Riwayat Kosong</p></div>`;
    document.getElementById("total-balance").innerText = "Rp 0";
    document.getElementById("total-income").innerText = "Rp 0";
    document.getElementById("total-expense").innerText = "Rp 0";
    if (financeChart) financeChart.destroy();
    return;
  }

  let tIn = 0,
    tOut = 0;
  let labels = [];
  let dataPoints = [];
  let currentBalance = 0;

  // 1. Urutkan dari yang TERLAMA untuk menghitung saldo berjalan di grafik
  const sortedForChart = [...transactions].sort((a, b) => a.id - b.id);

  sortedForChart.forEach((t) => {
    currentBalance += t.type === "income" ? t.amount : -t.amount;
    labels.push(t.date); // Gunakan tanggal sebagai label
    dataPoints.push(currentBalance); // Simpan saldo kumulatif
  });

  // 2. Render List Transaksi (Tetap yang terbaru di paling atas)
  transactions.forEach((t) => {
    if (t.type === "income") tIn += t.amount;
    else tOut += t.amount;

    const card = document.createElement("div");
    card.className = "transaction-card";
    card.onclick = () => deleteTransaction(t.id);
    card.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:45px; height:45px; border-radius:15px; display:flex; align-items:center; justify-content:center; background:${
                  t.type === "income" ? "#f0fdf4" : "#fef2f2"
                }; color:${t.type === "income" ? "#16a34a" : "#dc2626"}">
                    <i class="fas fa-${
                      t.type === "income" ? "arrow-down" : "arrow-up"
                    }"></i>
                </div>
                <div>
                    <span style="display:block; font-weight:700; color:#1e293b; font-size:0.9rem;">${
                      t.desc
                    }</span>
                    <span style="font-size:0.75rem; color:#94a3b8;">${
                      t.date
                    }</span>
                </div>
            </div>
            <div style="text-align:right">
                <strong style="color:${
                  t.type === "income" ? "#16a34a" : "#dc2626"
                }; display:block;">
                    ${
                      t.type === "income" ? "+" : "-"
                    } ${t.amount.toLocaleString()}
                </strong>
                <i class="fas fa-trash" style="font-size:0.6rem; color:#e2e8f0; margin-top:5px;"></i>
            </div>
        `;
    list.appendChild(card);
  });

  // 3. Update Dashboard Atas
  document.getElementById("total-balance").innerText = `Rp ${(
    tIn - tOut
  ).toLocaleString()}`;
  document.getElementById(
    "total-income"
  ).innerText = `Rp ${tIn.toLocaleString()}`;
  document.getElementById(
    "total-expense"
  ).innerText = `Rp ${tOut.toLocaleString()}`;

  // 4. Update Grafik (Tampilkan 10 perubahan saldo terakhir)
  updateChart(labels.slice(-10), dataPoints.slice(-10));
}

function updateChart(labels, data) {
  const canvas = document.getElementById("financeChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (financeChart) financeChart.destroy();

  const grad = ctx.createLinearGradient(0, 0, 0, 180);
  grad.addColorStop(0, "rgba(99, 102, 241, 0.4)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");

  financeChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          borderColor: "#6366f1",
          borderWidth: 3,
          fill: true,
          backgroundColor: grad,
          tension: 0.4, // Membuat garis melengkung smooth
          pointRadius: 5,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#6366f1",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          display: true,
          grid: { color: "#f1f5f9" },
          ticks: {
            font: { size: 9 },
            callback: (val) => "Rp " + val.toLocaleString(),
          },
        },
        x: { grid: { display: false }, ticks: { font: { size: 9 } } },
      },
    },
  });
}

// Jalankan fungsi saat pertama kali load
renderAll();
