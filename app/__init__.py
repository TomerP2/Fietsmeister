import os

from flask import Flask, render_template

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_mapping(
            POSTGRES_DB = 'fietsmeister_db',
            POSTGRES_USER = 'postgres',
            POSTGRES_PASSWORD = 'password',
            POSTGRES_HOST = 'localhost',
            POSTGRES_PORT = '5432',
        )
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # show main page
    @app.route('/')
    def show_main_page():
        return render_template('index.html')

    from . import db
    db.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)

    from . import map
    app.register_blueprint(map.bp)

    return app