import psycopg2

import pytest
from app.db import get_db, get_cursor


def test_get_close_db(app):
    with app.app_context():
        db = get_db()
        cursor = get_cursor()
        assert db is get_db()
        assert cursor is get_cursor()

    with pytest.raises(psycopg2.InterfaceError) as e:
        cursor.execute('SELECT * from nonexistent')

    assert 'closed' in str(e.value)


def test_init_db_command(runner, monkeypatch):
    class Recorder(object):
        called = False

    def fake_init_db():
        Recorder.called = True

    monkeypatch.setattr('app.db.init_db', fake_init_db)
    result = runner.invoke(args=['init-db'])
    assert 'Initialized' in result.output
    assert Recorder.called


def test_fake_data_loaded_correctly(app):
    with app.app_context():
        db = get_db()
        cursor = get_cursor()
        cursor.execute('SELECT * FROM users')
        assert len(cursor.fetchall()) == 3