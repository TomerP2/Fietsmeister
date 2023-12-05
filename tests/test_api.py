import json
from app.db import get_cursor
import pytest

def test_get_blokkage_info(client):
    response = client.get('/api/blokkageinfo/1')
    data = json.loads(response.data)
    assert data["id"] == 1
    assert data["username"] == "test"
    assert data["days_ago"] == 0
    assert data["marked_true"] == 2
    assert data["marked_false"] == 1


@pytest.mark.parametrize(('blokkage_id', 'user_id', 'message', 'blokkages_count'), (
    (1, '', b"Invalid input. Both blokkage_id and user_id are required.", 2), #No user_id
    ('', 1, b"Invalid input. Both blokkage_id and user_id are required.", 2), # No blokkage_id
    (200, 1, b"Blokkage with ID 200 does not exist.", 2), #Nonexistent blokkage_id
    (1, 1, b"Marked as true successfully.", 3) #Valid input
))
def test_mark_blokkage_true(client, app, blokkage_id, user_id, message, blokkages_count):
    response = client.post(
    '/api/marktrue',
    data={'blokkage_id': blokkage_id, 'user_id': user_id}
    )

    assert message in response.data
    with app.app_context():
        cursor = get_cursor()
        cursor.execute("SELECT COUNT(*) FROM marked_true WHERE blokkage_id = 1")
        count = cursor.fetchone()[0]
        assert count == blokkages_count
