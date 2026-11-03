# Penerbit Kandel - Website & Katalog Resmi (kandel.id)

Website resmi dan katalog interaktif untuk **Penerbit Kandel** (Penerbit buku cetakan dan alat peraga edukasi) yang berlokasi di **OnePM Building, Gading Serpong, Tangerang**.

Website ini mengadopsi estetika penerbitan prestisius seperti *Pitch Publishing*, *Gramedia Pustaka Utama (gpu.id)*, dan *Mizan (mizan.com)* dengan tipografi serif klasik yang elegan, tata letak katalog modern, dan panel admin terintegrasi dengan kemampuan **Edit Redaksi Live** di setiap halaman!

---

## 🚀 Cara Menjalankan Website

Website ini dibangun secara mandiri (*standalone client-side app*), sehingga **tidak memerlukan instalasi Node.js atau Python**:

1. Buka folder:
   `C:\Users\rechi\.gemini\antigravity\scratch\kandel-website`
2. **Klik dua kali file `index.html`** untuk langsung membukanya di browser Google Chrome, Microsoft Edge, Firefox, atau Safari.
   Atau salin URL berikut ke address bar browser:
   ```text
   file:///C:/Users/rechi/.gemini/antigravity/scratch/kandel-website/index.html
   ```

---

## 🔐 Akun Login Admin

Untuk mengelola katalog dan mengubah redaksi halaman:
- **Klik tombol "Login"** di menu kanan atas header.
- **Username**: `admin`
- **Password**: `adminkandel123!`

---

## ✏️ Fitur Edit Redaksi & Manajemen Live (Sesuai Permintaan)

Ketika login sebagai Admin Kandel:

### 1. Halaman Home (`#/home`)
- Muncul tombol **✏️ Edit Redaksi Home** di bagian atas.
- Admin dapat mengubah langsung teks:
  - Badge atas Hero
  - Judul Utama Hero (*Heading 1*)
  - Subtitel / Deskripsi Hero
  - Teks Spotlight Kandel (Judul & Deskripsi)
  - Teks Kutipan / Misi Filosofis & Nama Penulis Kutipan
- Semua perubahan langsung tersimpan ke LocalStorage dan ter-update seketika di layar!

### 2. Halaman Authors (`#/authors`)
- Muncul tombol **+ Tambah Author / Ilustrator Baru**.
- Di setiap kartu profil Author & Ilustrator tersedia tombol **Edit** dan **Hapus**.
- Admin dapat menambah atau mengubah nama, peran (*Author* atau *Ilustrator*), biografi singkat, dan total views.
- Sistem otomatis menghitung 3 Author teratas berdasarkan akumulasi views tertinggi dari buku yang mereka tulis!

### 3. Halaman Join Us (`#/join-us`)
- Muncul tombol **✏️ Edit Redaksi Join Us** untuk mengubah judul, ajakan, kotak kriteria penulis, dan kotak kriteria ilustrator.
- **Formulir Kirim Proposal / Portofolio**:
  Ketika pelamar mengisi formulir dan menekan tombol **"Kirim Proposal ke Redaksi Kandel"**:
  - Secara otomatis mengirim email ke: **`redaksi@kandel.co.id`**
  - Ditembuskan (CC) ke: **`finance@kandel.co.id`**
  - Subjek email terisi otomatis: `[Proposal Kontributor Kandel] - Nama (Peran)`
  - Isi surat terstruktur lengkap memuat nama, email, WhatsApp, peran, tautan portofolio, dan sinopsis naskah.

### 4. Halaman About Us (`#/about-us`)
- Muncul tombol **✏️ Edit Redaksi About Us**.
- Admin dapat mengedit langsung profil Kandel, visi ketepatan akademik, keunggulan alat peraga (*hands-on learning*), serta alamat kantor di OnePM Building Gading Serpong.

### 5. Single Post Katalog & Form Tambah Buku Cerdas
- **Fitur Autocomplete & Master Author pada Form Tambah Buku**:
  - Saat input `Author` atau `Ilustrator`, muncul **dropdown datalist nama-nama yang sudah terdaftar di master**.
  - **Auto-Fill Bio**: Jika memilih/mengetik nama yang sudah ada di master, **Bio Singkat otomatis ditarik dari master** dan ditampilkan di textarea.
  - **Validasi Penulis Baru**: Jika nama penulis belum pernah terdaftar, sistem mewajibkan pengisian Bio Singkat dan otomatis mendaftarkannya ke master Author Kandel saat disimpan!
- **Privasi Total Views (Viewer vs Admin)**:
  - Sebagai **viewer (pengunjung biasa)**: Total views disembunyikan sepenuhnya dari seluruh kartu buku, katalog, dan halaman authors untuk menjaga privasi statistik internal.
  - Sebagai **admin**: Angka views tetap dapat dipantau di indikator internal.
- Slider foto sampul **Cover Depan** $\leftrightarrow$ **Cover Belakang** (*Back Cover*).
- 9 Poin spesifikasi lengkap (*Subtitel, Author, Release Date, ISBN, Cover, Weight, Dimension, Pages, Sample PDF*).
- Kotak Description (kiri) dan About the Author (kanan).
- Tombol **Edit Post** dan **Hapus** untuk Admin.
- Tombol **+ Tambah Buku / Barang** di top bar.

---

## 🌐 Publikasi ke Domain kandel.id

Cukup unggah seluruh isi folder ini (`index.html`, folder `css`, folder `js`) ke direktori `public_html` di cPanel hosting domain `kandel.id`. Website langsung dapat diakses publik dengan sempurna!
