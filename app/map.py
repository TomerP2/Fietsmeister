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
