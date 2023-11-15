from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from fietsmeister.auth import login_required
from fietsmeister.db import get_db


bp = Blueprint('map', __name__)


@bp.route('/')
def index():
    return render_template('map/index.html')