import json
from application.db import get_cursor
import pytest

def test_get_blokkage_info(client):
    response = client.get('/api/blokkageinfo/1')
    data = json.loads(response.data)
    assert data["id"] == 1
    assert data["username"] == "test"
    assert data["days_ago"] == 0
    assert data["marked_true"] == 2
    assert data["marked_false"] == 0


def test_get_user_info(client, auth):
    auth.login()
    response = client.get('/api/currentuserinfo/')
    data = json.loads(response.data)
    assert data["id"] == 1 and data["username"] == "test" and data["marked_points"] == [1]


def test_get_user_info_validate(client, auth):
    response = client.get('/api/currentuserinfo/')
    data = json.loads(response.data)
    assert data["error"] == 'no logged in user'


@pytest.mark.parametrize(
    ('api_endpoint','blokkage_id', 'user_id', 'message', 'blokkages_count'), (
        ('marktrue', 1, '', b"Invalid input. Both blokkage_id and user_id are required.", 2), #Marked true; No user_id
        ('marktrue', '', 1, b"Invalid input. Both blokkage_id and user_id are required.", 2), #Marked true; No blokkage_id
        ('marktrue', 200, 1, b"Blokkage with ID 200 does not exist.", 2), #Marked true; Nonexistent blokkage_id
        ('marktrue', 1, 1, b"Succesfully marked.", 3), #Marked true; Valid input
        ('markfalse', 1, '', b"Invalid input. Both blokkage_id and user_id are required.", 0), #Marked false; No user_id
        ('markfalse', '', 1, b"Invalid input. Both blokkage_id and user_id are required.", 0), #Marked false; No blokkage_id
        ('markfalse', 200, 1, b"Blokkage with ID 200 does not exist.", 0), #Marked false; Nonexistent blokkage_id
        ('markfalse', 1, 1, b"Succesfully marked.", 1), #Marked false; Valid input
))
def test_mark_blokkage_true(client, app, api_endpoint, blokkage_id, user_id, message, blokkages_count):
    response = client.post(
        f'/api/{api_endpoint}',
        json={'blokkage_id': blokkage_id, 'user_id': user_id},
        content_type='application/json'
    )
    assert message in response.data

    if api_endpoint == 'marktrue': table = 'marked_true'
    else: table = 'marked_false'

    with app.app_context():
        cursor = get_cursor()
        cursor.execute(f"SELECT COUNT(*) FROM {table} WHERE blokkage_id = 1")
        count = cursor.fetchone()[0]
        assert count == blokkages_count


def test_create_new_blokkage(client, auth, app):
    auth.login()
    response = client.post(
        '/api/createblokkage',
        json={'lat': 1.0, 'lng': 1.0, 'user_id': 1},
        content_type='application/json'
    )
    assert  json.loads(response.data)["success"] == True

    with app.app_context():
        cursor = get_cursor()
        cursor.execute("SELECT COUNT(*) FROM blokkages")
        count = cursor.fetchone()[0]
        assert count == 3

