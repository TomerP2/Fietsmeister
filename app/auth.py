import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from werkzeug.security import check_password_hash, generate_password_hash

from app.db import get_cursor, get_db

from psycopg2.errors import UniqueViolation


bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_cursor().execute(
            'SELECT * FROM users WHERE id = ?', (user_id,)
        ).fetchone()


@bp.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        cursor = get_cursor()
        db = get_db()
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'

        if error is None:
            try:
                cursor.execute(
                    f"INSERT INTO users (username, password, active) VALUES ('{username}', '{generate_password_hash(password)}', TRUE)"
                )
                db.commit()
                return redirect(url_for("auth.login"))
            except UniqueViolation:
                error = 'already registered'
                

        flash(error)

    return render_template('auth/register.html')


@bp.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        cursor = get_cursor()
        error = None


        query = f"SELECT * FROM users WHERE username = '{username}'"
        print (f"query: {query}")

        cursor.execute(query)
        row = cursor.fetchone()
        print (f"row: {row}")

        user = {
            'username': row[0],
            'password': row[1] 
        }

        if user is None:
            error = 'Incorrect username.'
        elif not check_password_hash(user['password'], password):
            error = 'Incorrect password.'

        print (f"error: {error}")
        if error is None:
            print ('login succesful')
            session.clear()
            session['user_id'] = user['id']
            return redirect(url_for('map.map'))

        flash(error)

    return render_template('auth/login.html')


@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))

        return view(**kwargs)

    return wrapped_view