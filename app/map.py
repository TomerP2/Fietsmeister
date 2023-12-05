from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort

from app.auth import login_required
from app.db import get_cursor, get_db


bp = Blueprint('map', __name__)


@bp.route('/map')
def index():
    return render_template('map/map.html')


@bp.route('/api/blokkageinfo/<int:id>', methods=['GET'])
def get_blokkage_info(id):
    cursor = get_cursor()
    cursor.execute(f"""
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


@bp.route('/api/marktrue', methods=['POST'])
def mark_true():
    try:
        # Extract data from the request
        blokkage_id = request.form.get("blokkage_id")
        user_id = request.form.get("user_id")

        # Validate input
        if not blokkage_id or not user_id:
            raise ValueError("Invalid input. Both blokkage_id and user_id are required.")

        # Convert IDs to integers
        blokkage_id = int(blokkage_id)
        user_id = int(user_id)

        # Check if the blokkage exists (optional, depending on your requirements)
        if not blokkage_exists(blokkage_id):
            raise ValueError(f"Blokkage with ID {blokkage_id} does not exist.")

        cursor = get_cursor()
        db = get_db()

        # Use triple double quotes for the SQL query
        QUERY = "INSERT INTO marked_true (blokkage_id, created_by) VALUES (%s, %s)"

        cursor.execute(QUERY, (blokkage_id, user_id))
        db.commit()

        return jsonify({"success": True, "message": "Marked as true successfully."})

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