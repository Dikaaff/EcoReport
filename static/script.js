// Global variables
let map;
let vectorLayer;
let currentLocation = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupTabNavigation();
    setupForm();
    loadProvinces();
    initializeMap();
    loadDashboardData();
}

// Tab Navigation
function setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Update active nav button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(tab => tab.classList.remove('active'));
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // Refresh map if switching to dashboard
            if (targetTab === 'dashboard' && map) {
                setTimeout(() => {
                    map.updateSize();
                    loadDashboardData();
                }, 100);
            }
        });
    });
}

// Form Setup
function setupForm() {
    const form = document.getElementById('report-form');
    const locationBtn = document.getElementById('get-location');
    const fileInput = document.getElementById('photo');

    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Location button
    locationBtn.addEventListener('click', getCurrentLocation);
    
    // File upload preview
    fileInput.addEventListener('change', handleFilePreview);
}

// Load provinces for dropdown
async function loadProvinces() {
    try {
        const response = await fetch('/api/provinces/list');
        const provinces = await response.json();
        
        const select = document.getElementById('province');
        select.innerHTML = '<option value="">Pilih Provinsi</option>';
        
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province;
            option.textContent = province;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading provinces:', error);
    }
}

// Get current location
function getCurrentLocation() {
    const locationBtn = document.getElementById('get-location');
    const locationInfo = document.getElementById('location-info');
    
    if (!navigator.geolocation) {
        alert('Geolocation tidak didukung oleh browser ini.');
        return;
    }
    
    locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendapatkan lokasi...';
    locationBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            
            locationInfo.innerHTML = `
                <i class="fas fa-map-marker-alt"></i>
                <strong>Lokasi berhasil didapat:</strong><br>
                Latitude: ${currentLocation.latitude.toFixed(6)}<br>
                Longitude: ${currentLocation.longitude.toFixed(6)}
            `;
            locationInfo.classList.add('show');
            
            locationBtn.innerHTML = '<i class="fas fa-check"></i> Lokasi Didapat';
            locationBtn.style.background = '#4CAF50';
            locationBtn.style.color = 'white';
        },
        (error) => {
            console.error('Error getting location:', error);
            alert('Gagal mendapatkan lokasi. Pastikan Anda mengizinkan akses lokasi.');
            locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Dapatkan Lokasi Saat Ini';
            locationBtn.disabled = false;
        }
    );
}

// Handle file preview
function handleFilePreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('file-preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <p>${file.name}</p>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!currentLocation) {
        alert('Silakan dapatkan lokasi terlebih dahulu.');
        return;
    }
    
    const formData = new FormData();
    formData.append('description', document.getElementById('description').value);
    formData.append('province', document.getElementById('province').value);
    formData.append('latitude', currentLocation.latitude);
    formData.append('longitude', currentLocation.longitude);
    
    const photoFile = document.getElementById('photo').files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/reports', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccessModal();
            document.getElementById('report-form').reset();
            document.getElementById('location-info').classList.remove('show');
            document.getElementById('file-preview').innerHTML = '';
            currentLocation = null;
            
            // Reset location button
            const locationBtn = document.getElementById('get-location');
            locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Dapatkan Lokasi Saat Ini';
            locationBtn.style.background = 'transparent';
            locationBtn.style.color = '#4CAF50';
            locationBtn.disabled = false;
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Terjadi kesalahan saat mengirim laporan.');
    } finally {
        showLoading(false);
    }
}

// Initialize OpenLayers map
function initializeMap() {
    // Create map
    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([118.0148634, -2.548926]), // Indonesia center
            zoom: 5
        })
    });
    
    // Create vector layer for provinces
    vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector()
    });
    
    map.addLayer(vectorLayer);
    
    // Load provinces GeoJSON
    loadProvincesGeoJSON();
}

// Load provinces GeoJSON and apply styling
async function loadProvincesGeoJSON() {
    try {
        const [geoResponse, reportsResponse] = await Promise.all([
            fetch('/api/provinces'),
            fetch('/api/reports/per-province')
        ]);
        
        const geoData = await geoResponse.json();
        const reportCounts = await reportsResponse.json();
        
        // Create features from GeoJSON
        const features = new ol.format.GeoJSON().readFeatures(geoData, {
            featureProjection: 'EPSG:3857'
        });
        
        // Apply styling based on report counts
        features.forEach(feature => {
            const provinceName = feature.get('Propinsi');
            const reportCount = reportCounts[provinceName] || 0;
            
            // Determine color based on report count
            let fillColor;
            if (reportCount > 10) {
                fillColor = 'rgba(244, 67, 54, 0.7)'; // Red - many reports
            } else if (reportCount >= 5) {
                fillColor = 'rgba(255, 152, 0, 0.7)'; // Orange - medium reports
            } else if (reportCount > 0) {
                fillColor = 'rgba(76, 175, 80, 0.7)'; // Green - few reports
            } else {
                fillColor = 'rgba(224, 224, 224, 0.7)'; // Gray - no reports
            }
            
            const style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: fillColor
                }),
                stroke: new ol.style.Stroke({
                    color: '#333',
                    width: 1
                })
            });
            
            feature.setStyle(style);
            feature.set('reportCount', reportCount);
        });
        
        // Add features to vector layer
        vectorLayer.getSource().addFeatures(features);
        
        // Add click interaction
        map.on('click', function(event) {
            const feature = map.forEachFeatureAtPixel(event.pixel, function(feature) {
                return feature;
            });
            
            if (feature) {
                const provinceName = feature.get('Propinsi');
                const reportCount = feature.get('reportCount');
                
                // Show popup or info about the province
                alert(`Provinsi: ${provinceName}\nJumlah Laporan: ${reportCount}`);
            }
        });
        
    } catch (error) {
        console.error('Error loading map data:', error);
    }
}

// Load dashboard statistics
async function loadDashboardData() {
    try {
        const response = await fetch('/api/reports');
        const reports = await response.json();

        // Update statistik
        const totalReports = reports.length;
        const pendingReports = reports.filter(r => r.status === 'pending').length;
        const resolvedReports = reports.filter(r => r.status === 'resolved').length;

        document.getElementById('total-reports').textContent = totalReports;
        document.getElementById('pending-reports').textContent = pendingReports;
        document.getElementById('resolved-reports').textContent = resolvedReports;

        // 🔽 Tampilkan daftar laporan
        const feedContainer = document.getElementById('report-feed');
        feedContainer.innerHTML = '';

        reports.reverse().forEach(report => {
            const card = document.createElement('div');
            card.className = 'report-card';

            card.innerHTML = `
                <h4>${report.province}</h4>
                <p>${report.description}</p>
                <small>Status: ${report.status} | ${new Date(report.created_at).toLocaleString()}</small>
                ${report.photo_filename ? `<img src="/uploads/${report.photo_filename}" alt="Foto Laporan">` : ''}
            `;
            feedContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Utility functions
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('show');
    } else {
        loading.classList.remove('show');
    }
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('show');
}

