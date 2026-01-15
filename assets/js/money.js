let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let financeChart;

// --- 1. MODAL CONTROL (STATISTIK & TRANSAKSI) ---
function openFinanceStats() {
  document.getElementById("finance-stats-modal").style.display = "flex";
  // Render chart hanya saat modal dibuka agar performa HP Android 10 tetap lancar
  setTimeout(() => {
    renderAll();
  }, 100);
}

function closeFinanceStats() {
  document.getElementById("finance-stats-modal").style.display = "none";
}

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

// --- 2. LOGIKA SIMPAN TRANSAKSI ---
document.getElementById("save-money-btn").onclick = () => {
  const amount = parseInt(document.getElementById("amount-input").value);
  const desc = document.getElementById("desc-input").value.trim();

  if (!amount || !desc) return alert("Mohon isi semua data!");

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

  transactions.unshift({
    id: Date.now(),
    type: window.currentType,
    amount: amount,
    desc: desc,
    date: dateStr,
    timestamp: now.getTime(), // Untuk pengurutan grafik yang lebih presisi
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderAll();
  closeMoneyModal();
};

// --- 3. FITUR HAPUS ---
function deleteTransaction(id) {
  if (confirm("Hapus catatan ini?")) {
    transactions = transactions.filter((t) => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderAll();
  }
}

function clearAllTransactions() {
  if (transactions.length === 0) return alert("Riwayat sudah kosong!");
  if (confirm("Hapus semua riwayat transaksi?")) {
    transactions = [];
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderAll();
  }
}

// --- 4. RENDER DASHBOARD & LIST ---
function renderAll() {
  const list = document.getElementById("transaction-list");
  const insightText = document.getElementById("finance-insight");
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
  let cumulativeBalance = 0;

  // Urutkan dari yang TERLAMA khusus untuk perhitungan saldo berjalan di grafik
  const sortedForChart = [...transactions].sort((a, b) => a.id - b.id);

  sortedForChart.forEach((t) => {
    cumulativeBalance += t.type === "income" ? t.amount : -t.amount;
    labels.push(t.date);
    dataPoints.push(cumulativeBalance);
  });

  // Render List Utama (Terbaru di atas)
  transactions.forEach((t) => {
    if (t.type === "income") tIn += t.amount;
    else tOut += t.amount;

    const card = document.createElement("div");
    card.className = "transaction-item"; // Sesuai class CSS baru
    card.innerHTML = `
            <div class="trans-icon ${
              t.type === "income" ? "icon-in" : "icon-out"
            }">
                <i class="fas fa-${
                  t.type === "income" ? "arrow-down" : "arrow-up"
                }"></i>
            </div>
            <div style="flex:1">
                <span style="display:block; font-weight:700; color:#1e293b; font-size:0.9rem;">${
                  t.desc
                }</span>
                <span style="font-size:0.75rem; color:#94a3b8;">${t.date}</span>
            </div>
            <div style="text-align:right">
                <strong style="color:${
                  t.type === "income" ? "#10b981" : "#ef4444"
                }; display:block;">
                    ${
                      t.type === "income" ? "+" : "-"
                    } ${t.amount.toLocaleString()}
                </strong>
                <i class="fas fa-trash" onclick="deleteTransaction(${
                  t.id
                })" style="font-size:0.7rem; color:#e2e8f0; cursor:pointer;"></i>
            </div>
        `;
    list.appendChild(card);
  });

  // Update Angka di Card Atas
  const totalSaldo = tIn - tOut;
  document.getElementById(
    "total-balance"
  ).innerText = `Rp ${totalSaldo.toLocaleString()}`;
  document.getElementById(
    "total-income"
  ).innerText = `Rp ${tIn.toLocaleString()}`;
  document.getElementById(
    "total-expense"
  ).innerText = `Rp ${tOut.toLocaleString()}`;

  // Update Insight Keuangan Sederhana
  if (insightText) {
    if (totalSaldo < 0)
      insightText.innerText = "⚠️ Pengeluaran melebihi pemasukan!";
    else if (tOut > tIn * 0.8)
      insightText.innerText = "💡 Boros nih, kurangi jajan ya!";
    else insightText.innerText = "✅ Keuanganmu terpantau stabil bulan ini.";
  }

  // Render Grafik di dalam Modal
  updateChart(labels.slice(-7), dataPoints.slice(-7));
}

// --- 5. CHART.JS CONFIGURATION ---
function updateChart(labels, data) {
  const canvas = document.getElementById("financeChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (financeChart) financeChart.destroy();

  const grad = ctx.createLinearGradient(0, 0, 0, 200);
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
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#6366f1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: {
            font: { size: 9 },
            callback: (v) => "Rp " + v.toLocaleString(),
          },
        },
        x: { ticks: { font: { size: 9 } } },
      },
    },
  });
}

// --- 6. STRUK LOGIC (SUDAH ADA) ---
function showReceipt() {
  if (transactions.length === 0) return alert("Belum ada data!");
  const rItems = document.getElementById("r-items");
  document.getElementById("r-date").innerText = new Date().toLocaleString(
    "id-ID"
  );
  rItems.innerHTML = "";

  transactions.slice(0, 8).forEach((t) => {
    const item = document.createElement("div");
    item.className = "receipt-item";
    item.innerHTML = `
            <span>${t.desc.toUpperCase()}</span>
            <span>${t.amount.toLocaleString()}</span>
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
  html2canvas(area, { backgroundColor: "#ffffff", scale: 2 }).then((canvas) => {
    const link = document.createElement("a");
    link.download = `Struk-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

// Menutup modal statistik jika klik di luar area konten
window.onclick = (e) => {
  const statsModal = document.getElementById("finance-stats-modal");
  const transModal = document.getElementById("money-modal");
  if (e.target == statsModal) closeFinanceStats();
  if (e.target == transModal) closeMoneyModal();
};

// Jalankan saat pertama kali dibuka
renderAll();
