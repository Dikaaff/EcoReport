# Panduan Penggunaan Sistem Pengaduan Lingkungan EcoReport

## Akses Website
Website dapat diakses melalui URL: **https://60h5imcegoyd.manus.space**

## Fitur Utama

### 1. Form Laporan Pengaduan
Fitur ini memungkinkan masyarakat untuk melaporkan masalah lingkungan yang ditemukan.

**Cara Menggunakan:**
1. Klik tab "Buat Laporan" di bagian atas halaman
2. Isi form dengan informasi berikut:
   - **Deskripsi Masalah**: Jelaskan masalah lingkungan yang ditemukan secara detail
   - **Provinsi**: Pilih provinsi tempat masalah ditemukan dari dropdown
   - **Foto Bukti**: Upload foto sebagai bukti (opsional)
   - **Lokasi**: Klik tombol "Dapatkan Lokasi Saat Ini" untuk mendapatkan koordinat GPS
3. Klik tombol "Kirim Laporan" untuk mengirim laporan

**Catatan Penting:**
- Pastikan browser mengizinkan akses lokasi untuk fitur GPS
- Format foto yang didukung: PNG, JPG, JPEG, GIF
- Semua field wajib diisi kecuali foto

### 2. Dashboard Peta Interaktif
Dashboard menampilkan visualisasi laporan pengaduan per provinsi dalam bentuk peta Indonesia.

**Cara Menggunakan:**
1. Klik tab "Dashboard" di bagian atas halaman
2. Lihat peta Indonesia dengan pewarnaan berdasarkan jumlah laporan:
   - **Merah**: Banyak laporan (>10)
   - **Kuning/Orange**: Laporan sedang (5-10)
   - **Hijau**: Sedikit laporan (1-4)
   - **Abu-abu**: Tidak ada laporan
3. Klik pada provinsi di peta untuk melihat detail jumlah laporan
4. Lihat statistik ringkasan di bagian bawah:
   - Total Laporan
   - Laporan Menunggu
   - Laporan Selesai

## Teknologi yang Digunakan

### Backend
- **Flask**: Framework web Python untuk API
- **SQLite**: Database untuk menyimpan laporan
- **Flask-CORS**: Untuk menangani cross-origin requests

### Frontend
- **HTML5/CSS3/JavaScript**: Teknologi web standar
- **OpenLayers**: Library peta interaktif
- **Font Awesome**: Icon library
- **Google Fonts**: Typography

### Data Geografis
- **GeoJSON**: Format data geografis untuk provinsi Indonesia
- **OpenStreetMap**: Tile layer untuk peta dasar

## API Endpoints

### Laporan
- `POST /api/reports` - Membuat laporan baru
- `GET /api/reports` - Mengambil semua laporan
- `GET /api/reports/by-province` - Mengambil jumlah laporan per provinsi
- `GET /api/reports/{id}` - Mengambil detail laporan
- `PUT /api/reports/{id}/status` - Update status laporan

### Geografis
- `GET /api/provinces` - Mengambil data GeoJSON provinsi Indonesia
- `GET /api/provinces/list` - Mengambil daftar nama provinsi

## Struktur Database

### Tabel Reports
- `id`: Primary key
- `description`: Deskripsi masalah
- `latitude`: Koordinat lintang
- `longitude`: Koordinat bujur
- `province`: Nama provinsi
- `photo_filename`: Nama file foto (opsional)
- `created_at`: Timestamp pembuatan
- `status`: Status laporan (pending/in_progress/resolved)

## Keamanan dan Privacy
- Lokasi GPS hanya digunakan untuk keperluan laporan
- Data foto disimpan secara aman di server
- Tidak ada data personal yang dikumpulkan selain yang diperlukan untuk laporan

## Dukungan Browser
Website ini kompatibel dengan browser modern yang mendukung:
- HTML5 Geolocation API
- ES6 JavaScript
- CSS3 Flexbox/Grid
- WebGL (untuk rendering peta)

## Troubleshooting

### Masalah Umum:
1. **Lokasi tidak terdeteksi**: Pastikan browser mengizinkan akses lokasi
2. **Peta tidak muncul**: Periksa koneksi internet dan refresh halaman
3. **Upload foto gagal**: Pastikan ukuran file tidak terlalu besar (max 10MB)
4. **Dropdown provinsi kosong**: Refresh halaman atau periksa koneksi internet

### Browser yang Direkomendasikan:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Kontak dan Dukungan
Untuk pertanyaan teknis atau masalah penggunaan, silakan hubungi administrator sistem.

---
*Sistem ini dikembangkan untuk membantu masyarakat dalam melaporkan masalah lingkungan dan memantau kondisi lingkungan di seluruh Indonesia.*

