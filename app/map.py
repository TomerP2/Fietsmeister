from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from app.auth import login_required
from app.db import get_db


bp = Blueprint('map', __name__)


@bp.route('/map')
def index():
    return render_template('map/map.html')