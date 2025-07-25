import os
import json
from flask import Blueprint, jsonify

geo_bp = Blueprint('geo', __name__)

@geo_bp.route('/provinces', methods=['GET'])
def get_provinces():
    """Return Indonesia provinces GeoJSON data"""
    try:
        # Path to the GeoJSON file
        geojson_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'indonesia-provinces.geojson')
        
        with open(geojson_path, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)
            
        return jsonify(geojson_data)
    except FileNotFoundError:
        return jsonify({'error': 'GeoJSON file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@geo_bp.route('/provinces/list', methods=['GET'])
def get_province_list():
    """Return list of province names for form dropdown"""
    try:
        # Path to the GeoJSON file
        geojson_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'indonesia-provinces.geojson')
        
        with open(geojson_path, 'r', encoding='utf-8') as f:
            geojson_data = json.load(f)
            
        # Extract province names from GeoJSON
        provinces = []
        for feature in geojson_data['features']:
            province_name = feature['properties']['Propinsi']
            provinces.append(province_name)
            
        # Sort provinces alphabetically
        provinces.sort()
        
        return jsonify(provinces)
    except FileNotFoundError:
        return jsonify({'error': 'GeoJSON file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

