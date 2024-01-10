# Sources:
# https://github.com/Azure-Samples/msdocs-flask-postgresql-sample-app
# https://flask.palletsprojects.com/en/3.0.x/

import os

from flask import Flask, render_template
from flask_cors import CORS

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, static_folder='static')

    # Allows access between Flask app and geoserver. #TODO: Change this to only allow access to geoserver port
    CORS(app)

    # WEBSITE_HOSTNAME exists only in production environment
    if 'WEBSITE_HOSTNAME' not in os.environ:
        # local development, where we'll use environment variables
        print("Loading config.development and environment variables from .env file.")
        app.config.from_object('config.development')
    else:
        # production
        print("Loading config.production.")
        app.config.from_object('config.production')

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