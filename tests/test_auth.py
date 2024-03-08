import pytest
from flask import g, session
from application.db import get_cursor


def test_register(client, app):
    assert client.get('/auth/register').status_code == 200
    response = client.post(
        '/auth/register', data={'email': 'a@email.com', 'password': 'a'}
    )
    assert response.headers["Location"] == "/auth/login"

    with app.app_context():
        cursor = get_cursor()
        cursor.execute("SELECT * FROM users WHERE username = 'a@email.com'")
        row = cursor.fetchone()
        assert row is not None


@pytest.mark.parametrize(('username', 'password', 'message'), (
    ('', '', b'Email is required.'),
    ('a@email.com', '', b'Password is required.'),
    ('test@email.com', 'test', b'already registered'),
))
def test_register_validate_input(client, username, password, message):
    response = client.post(
        '/auth/register',
        data={'email': username, 'password': password}
    )
    print (response.data)
    assert message in response.data


def test_login(client, auth):
    assert client.get('/auth/login').status_code == 200
    response = auth.login()
    assert response.headers["Location"] == "/map"

    with client:
        client.get('/')
        assert session['user_id'] == 1
        assert g.user['username'] == 'test@email.com'


@pytest.mark.parametrize(('username', 'password', 'message'), (
    ('a', 'test', b'Incorrect username.'),
    ('test@email.com', 'a', b'Incorrect password.'),
))
def test_login_validate_input(auth, username, password, message):
    response = auth.login(username, password)
    assert message in response.data


def test_logout(client, auth):
    auth.login()

    with client:
        auth.logout()
        assert 'user_id' not in session