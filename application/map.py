from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify, current_app
)
from werkzeug.exceptions import abort

from application.auth import login_required
from application.db import get_cursor, get_db


bp = Blueprint('map', __name__)


@bp.route('/map')
@login_required
def index():
    return render_template('map/map.html')

@bp.route('/api/getblokkagesgeojson/', methods=['GET'])
def get_blokkages_geojson():
    cursor = get_cursor()
    QUERY = "SELECT id, ST_AsGeoJSON(geom)::json AS geometry FROM blokkages"
    cursor.execute(QUERY)
    query_res = cursor.fetchall()

    features = []
    for row in query_res:
        feature = {
            "type": "Feature",
            "geometry": row[1],
            "properties": {
                "id": row[0]
            }
        }
        features.append(feature)
    
    feature_collection = {"type": "FeatureCollection", "features": features}
    return jsonify(feature_collection)

@bp.route('/api/blokkageinfo/<int:id>', methods=['GET'])
def get_blokkage_info(id):
    cursor = get_cursor()
    cursor.execute("""
    SELECT 
    EXTRACT(DAY FROM (NOW() - b.created_at)) AS days_ago,
    u.username,
    (SELECT COUNT(*) FROM marked_true mt WHERE b.id = mt.blokkage_id) AS marked_true,
    (SELECT COUNT(*) FROM marked_false mt WHERE b.id = mt.blokkage_id) AS marked_false
    FROM blokkages b
    JOIN users u on b.created_by = u.id
    WHERE b.id = %s
    """, (id,))
    row = cursor.fetchone()
    data = {
        "id": int(id),
        "days_ago": int(row[0]),
        "username": str(row[1]),
        "marked_true": int(row[2]),
        "marked_false": int(row[3])
    }
    return jsonify(data)


@bp.route('/api/currentuserinfo/', methods=['GET'])
def get_current_user_info():
    if g.user:
        return jsonify({
            "id": g.user["id"],
            "username": g.user["username"],
            "marked_points": g.user["marked_points"],
        })
    else:
        return jsonify({
            "error": "no logged in user"
        })


@bp.route('/api/marktrue', methods=['POST'])
def mark_true():
    return mark_true_or_false(request, True)


@bp.route('/api/markfalse', methods=['POST'])
def mark_false():
    return mark_true_or_false(request, False)
    

def mark_true_or_false(request, marked_true):
    try:
        # Extract data from the request
        data = request.get_json()
        blokkage_id = data.get("blokkage_id")
        user_id = data.get("user_id")

        # Validate input
        if not blokkage_id or not user_id:
            raise ValueError("Invalid input. Both blokkage_id and user_id are required.")

        # Convert IDs to integers
        blokkage_id = int(blokkage_id)
        user_id = int(user_id)

        # Check if the blokkage exists
        if not blokkage_exists(blokkage_id):
            raise ValueError(f"Blokkage with ID {blokkage_id} does not exist.")

        # Add point to either 'marked_true' table or 'marked_false' table
        cursor = get_cursor()
        db = get_db()

        if marked_true: table = 'marked_true'
        else: table = 'marked_false'

        cursor.execute(f"INSERT INTO {table} (blokkage_id, created_by) VALUES (%s, %s)",
                       (blokkage_id, user_id))
        db.commit()
        
        return jsonify({"success": True, "message": "Succesfully marked."})

    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)})

    except Exception as e:
        # Log the exception for debugging purposes
        print(f"An error occurred: {str(e)}")
        return jsonify({"success": False, "error": "An unexpected error occurred."})


def blokkage_exists(blokkage_id):
    cursor = get_cursor()
    QUERY = "SELECT COUNT(*) FROM blokkages WHERE id = %s"
    cursor.execute(QUERY, (blokkage_id,))
    count = cursor.fetchone()[0]
    return count == 1


@bp.route('/api/createblokkage', methods=['POST'])
def create_blokkage():
    try:
        data = request.get_json()
        lat = float(data.get("lat"))
        lng = float(data.get("lng"))
        user_id = str(data.get("user_id"))

        if not data or not lng or not lat:
            raise ValueError(f"Invalid input when creating new blokkage: Lat: {lat}, lng: {lng}, user_id: {user_id}")
        
        cursor = get_cursor()
        db = get_db()
        query = """
        INSERT INTO blokkages (geom, created_by)
        VALUES (ST_SetSRID(ST_MakePoint(%s, %s),4326), %s)
        """
        cursor.execute(query, (lng, lat, user_id))
        db.commit()
        return jsonify({
            "success": True,
        })
        
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)})

    except Exception as e:
            # Log the exception for debugging purposes
            print(f"An error occurred: {str(e)}")
            return jsonify({"success": False, "error": "An unexpected error occurred."})