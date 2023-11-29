import json

def test_get_blokkage_info(client):
    response = client.get('/api/blokkageinfo/1')
    data = json.loads(response.data)
    assert data["id"] == 1
    assert data["username"] == "test"
    assert data["days_ago"] == 0
    assert data["marked_true"] == 2
    assert data["marked_false"] == 1
