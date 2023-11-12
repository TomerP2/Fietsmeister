# /app/__init__.py

from flask import Flask
from config.config import Config
from app.models.db import db, User, Role
from flask_security import Security, SQLAlchemyUserDatastore

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize the database
    db.init_app(app)

    # Setup Flask-Security
    user_datastore = SQLAlchemyUserDatastore(db, User, Role)
    security = Security(app, user_datastore)

    # Register blueprints
    from app.main import bp as main_bp
    app.register_blueprint(main_bp)

    # Auth blueprints. To be added later.
    # from app.auth import bp as auth_bp
    # app.register_blueprint(auth_bp, url_prefix='/auth')

    return app
