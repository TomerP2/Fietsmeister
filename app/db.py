import psycopg2
import click
from flask import current_app, g
from flask.cli import with_appcontext

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)

def get_user_by_id(user_id):
    cursor = get_cursor()
    cursor.execute(f'SELECT * FROM users WHERE id = {user_id}')
    row = cursor.fetchone()

    if row is None:
        return None
    
    return {
        'id': row[0],
        'username': row[1],
        'password': row[2],
    }

def get_user_by_username(username):
    cursor = get_cursor()
    cursor.execute(f"SELECT * FROM users WHERE username = '{username}'")
    row = cursor.fetchone()

    if row is None:
        return None

    return {
        'id': row[0],
        'username': row[1],
        'password': row[2],
    }

def get_cursor():
    db = get_db()
    if 'cursor' not in g:
        g.cursor = db.cursor()

    return g.cursor

def get_db():
    if 'db' not in g:
        dbname = current_app.config['POSTGRES_DB']
        user = current_app.config['POSTGRES_USER']
        password = current_app.config['POSTGRES_PASSWORD']
        host = current_app.config['POSTGRES_HOST']
        port = current_app.config['POSTGRES_PORT']

        g.db = psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)

    return g.db

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')

def init_db():
    db = get_db()
    cursor = db.cursor()

    with current_app.open_resource('schema.sql') as f:
        cursor.execute(f.read().decode('utf8'))

    db.commit()
    cursor.close()