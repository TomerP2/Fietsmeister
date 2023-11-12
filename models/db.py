# /app/models/db.py

from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    active = db.Column(db.Boolean())
    roles = db.relationship('Role', secondary='roles_users', backref=db.backref('users', lazy='dynamic'))

class Blokkage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    geom = db.Column(db.Geometry('POINT'))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))

class MarkedFalse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    blokkage_id = db.Column(db.Integer, db.ForeignKey('blokkage.id'))
    time = db.Column(db.DateTime, server_default=db.func.now())
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))

class MarkedTrue(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    blokkage_id = db.Column(db.Integer, db.ForeignKey('blokkage.id'))
    time = db.Column(db.DateTime, server_default=db.func.now())
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
