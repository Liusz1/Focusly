const profileImg = document.getElementById("profile-img");
const fileUpload = document.getElementById("file-upload");
const usernameInput = document.getElementById("username-input");
const fullnameInput = document.getElementById("fullname-input");
const aboutInput = document.getElementById("about-input");

// 1. LOAD DATA - Dibuat efisien agar transisi halaman instant
window.onload = function () {
  const savedData = JSON.parse(localStorage.getItem("userProfile"));

  if (savedData) {
    usernameInput.value = savedData.username || "";
    fullnameInput.value = savedData.fullname || "";
    aboutInput.value = savedData.about || "";
    if (savedData.profilePic) {
      profileImg.src = savedData.profilePic;
    }
  }
};

// 2. LOGIKA UPLOAD DENGAN AUTO-COMPRESS
fileUpload.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function () {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 200;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Kompres ke format JPEG kualitas 0.6 agar ringan di localStorage
        const compressedData = canvas.toDataURL("image/jpeg", 0.6);
        profileImg.src = compressedData;
      };
    };
    reader.readAsDataURL(file);
  }
});

// 3. FUNGSI SIMPAN
window.saveProfileData = function () {
  const profileData = {
    username: usernameInput.value.trim(),
    fullname: fullnameInput.value.trim(),
    about: aboutInput.value.trim(),
    profilePic: profileImg.src,
  };

  try {
    localStorage.setItem("userProfile", JSON.stringify(profileData));
    alert("Profil diperbarui! Sekarang loading akan jauh lebih cepat.");
  } catch (e) {
    alert("Gagal menyimpan, memori penuh!");
  }
};

// 4. LOGIKA MODAL INFO (PENGGANTI SCROLL)
// Fungsi untuk buka/tutup modal
window.toggleInfoModal = function () {
  const modal = document.getElementById("infoModal");
  if (!modal) return;

  if (modal.style.display === "flex") {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Aktifkan scroll kembali
  } else {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // Kunci scroll saat modal buka
  }
};

// Menutup modal jika user klik di area gelap (overlay)
window.addEventListener("click", (event) => {
  const modal = document.getElementById("infoModal");
  if (event.target === modal) {
    toggleInfoModal();
  }
});
