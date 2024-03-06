import functools

from flask import (
    Blueprint, flash, g, jsonify, redirect, render_template, request, session, url_for
)
from werkzeug.security import check_password_hash, generate_password_hash

from application.db import get_cursor, get_db, get_user_by_id, get_user_by_username

from psycopg2.errors import UniqueViolation

from email_validator import validate_email, EmailNotValidError

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_user_by_id(user_id)

@bp.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        email_str = request.form['email']
        password = request.form['password']
        cursor = get_cursor()
        db = get_db()
        error = None

        if not email_str:
            error = 'Email is required.'

        elif not password:
            error = 'Password is required.'

        if error is None:
            try:
                email = validate_email(email_str)
                cursor.execute(
                    "INSERT INTO users (username, password, active) VALUES (%s, %s, TRUE)",
                    (email.normalized,  generate_password_hash(password))
                )
                db.commit()
                return redirect(url_for("auth.login"))
            
            except UniqueViolation:
                error = 'already registered'

            except EmailNotValidError as e:
                error = str(e)
                
        flash(error)

    return render_template('auth/register.html')


@bp.route('/login', methods=('GET', 'POST'))
def login():
    try:
        if request.method == 'POST':
            username = request.form['username']
            password = request.form['password']
            error = None
            user = get_user_by_username(username)

            if user is None:
                error = 'Incorrect username.'
            elif not check_password_hash(user['password'], password):
                error = 'Incorrect password.'

            if error is None:
                print ('login succesful')
                session.clear()
                session['user_id'] = user['id']
                return redirect(url_for('map.index'))

            flash(error)

        return render_template('auth/login.html')
    except Exception as e:
        print (f"Error while logging in: {str(e)}")


@bp.route('/logout')
def logout():
    session.clear()
    return jsonify({'status': 'success', 'message': 'Logout successful'})


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect('.')

        return view(**kwargs)

    return wrapped_view