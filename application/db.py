import psycopg2
import click
from flask import current_app, g
from flask.cli import with_appcontext

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)

def get_user_by_id(user_id):
    return get_user_by_id_or_username(user_id, True)

def get_user_by_username(username):
    return get_user_by_id_or_username(username, False)

def get_user_by_id_or_username(input, is_ID):
    cursor = get_cursor()
    if is_ID: column = 'id'
    else: column = 'username'

    cursor.execute(f"SELECT * FROM users WHERE {column} = %s", (input,))
    row = cursor.fetchone()

    if row is None:
        return None

    return {
        'id': row[0],
        'username': row[1],
        'password': row[2],
        'marked_points': get_points_marked_by_user(row[0], cursor)
    }
 
def get_points_marked_by_user(id, cursor):
    points = []
    for table in ("marked_true", "marked_false"):
        cursor.execute(f"SELECT blokkage_id FROM {table} WHERE created_by = %s", (id,))
        results = cursor.fetchall()
        for result in results:
            points.append(result[0])
    return points

def get_cursor():
    db = get_db()
    if 'cursor' not in g:
        g.cursor = db.cursor()

    return g.cursor

def get_db():
    if 'db' not in g:
        dbname = current_app.config['DBNAME']
        user = current_app.config['DBUSER']
        password = current_app.config['DBPASS']
        host = current_app.config['DBHOST']

        g.db = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)

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