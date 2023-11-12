# fietsmeister/config/config.py

class Config:
    SECRET_KEY = 'your_secret_key'
    SQLALCHEMY_DATABASE_URI = 'postgresql://username:password@hostname:port/database_name'  # Update with your database URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False