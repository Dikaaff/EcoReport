from flask import Blueprint, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db
from sqlalchemy import func

report_bp = Blueprint('report', __name__)

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    province = db.Column(db.String(100), nullable=False)
    photo_filename = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')

    def __repr__(self):
        return f'<Report {self.id}: {self.description[:50]}...>'

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'province': self.province,
            'photo_filename': self.photo_filename,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'status': self.status
        }

# ✅ SIMPAN LAPORAN
@report_bp.route('/reports', methods=['POST'])
def create_report():
    try:
        description = request.form.get('description')
        province = request.form.get('province')
        latitude = request.form.get('latitude', type=float)
        longitude = request.form.get('longitude', type=float)
        photo_filename = request.form.get('photo_filename')  # opsional

        if not description or not province or not latitude or not longitude:
            return jsonify({'error': 'Data tidak lengkap'}), 400

        report = Report(
            description=description,
            province=province,
            latitude=latitude,
            longitude=longitude,
            photo_filename=photo_filename
        )
        db.session.add(report)
        db.session.commit()
        return jsonify({'message': 'Laporan berhasil dikirim'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ HITUNG LAPORAN PER PROVINSI
@report_bp.route('/reports/per-province', methods=['GET'])
def report_count_by_province():
    results = db.session.query(
        Report.province,
        func.count(Report.id).label('jumlah')
    ).group_by(Report.province).all()

    data = {prov: jumlah for prov, jumlah in results}
    return jsonify(data)

# ✅ TAMPILKAN SEMUA LAPORAN (UNTUK DASHBOARD)
@report_bp.route('/reports', methods=['GET'])
def get_all_reports():
    reports = Report.query.order_by(Report.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reports])
