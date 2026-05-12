import os
import requests
from datetime import date, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://laundry-book-9.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

# Use a far-future date to avoid colliding with prior data
TEST_DATE = (date.today() + timedelta(days=30)).isoformat()
END_DATE = (date.today() + timedelta(days=31)).isoformat()
START_DATE = (date.today() - timedelta(days=1)).isoformat()


def _cleanup(user="TEST_USER"):
    r = requests.get(f"{API}/reservations", params={"start_date": START_DATE, "end_date": END_DATE})
    if r.status_code == 200:
        for res in r.json():
            if res["date"] == TEST_DATE:
                requests.delete(f"{API}/reservations/{res['id']}", json={"user_name": res["user_name"]})


def setup_module(module):
    _cleanup()


def teardown_module(module):
    _cleanup()


def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200


def test_list_reservations_returns_list():
    r = requests.get(f"{API}/reservations", params={"start_date": START_DATE, "end_date": END_DATE})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_create_1h_reservation_and_persist():
    payload = {"user_name": "TEST_Alex", "date": TEST_DATE, "start_hour": 8, "duration": 1}
    r = requests.post(f"{API}/reservations", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user_name"] == "TEST_Alex"
    assert data["start_hour"] == 8
    assert data["duration"] == 1
    assert "id" in data
    assert "_id" not in data
    # verify persisted via GET
    g = requests.get(f"{API}/reservations", params={"start_date": TEST_DATE, "end_date": TEST_DATE})
    ids = [x["id"] for x in g.json()]
    assert data["id"] in ids
    for x in g.json():
        assert "_id" not in x


def test_create_2h_reservation():
    payload = {"user_name": "TEST_Bob", "date": TEST_DATE, "start_hour": 14, "duration": 2}
    r = requests.post(f"{API}/reservations", json=payload)
    assert r.status_code == 200, r.text
    assert r.json()["duration"] == 2


def test_conflict_409_1h_vs_existing_1h():
    payload = {"user_name": "TEST_Carl", "date": TEST_DATE, "start_hour": 8, "duration": 1}
    r = requests.post(f"{API}/reservations", json=payload)
    assert r.status_code == 409


def test_conflict_409_2h_overlapping_1h():
    # existing 1h at 8 -> a 2h starting at 7 should overlap with hour 8
    payload = {"user_name": "TEST_Dan", "date": TEST_DATE, "start_hour": 7, "duration": 2}
    r = requests.post(f"{API}/reservations", json=payload)
    assert r.status_code == 409


def test_invalid_duration():
    payload = {"user_name": "TEST_Eve", "date": TEST_DATE, "start_hour": 5, "duration": 3}
    r = requests.post(f"{API}/reservations", json=payload)
    assert r.status_code == 400


def test_invalid_2h_at_23():
    payload = {"user_name": "TEST_Fay", "date": TEST_DATE, "start_hour": 23, "duration": 2}
    r = requests.post(f"{API}/reservations", json=payload)
    assert r.status_code == 400


def test_cancel_wrong_user_403_then_correct_user_200():
    payload = {"user_name": "TEST_Owner", "date": TEST_DATE, "start_hour": 20, "duration": 1}
    r = requests.post(f"{API}/reservations", json=payload)
    assert r.status_code == 200
    rid = r.json()["id"]
    # wrong user
    w = requests.delete(f"{API}/reservations/{rid}", json={"user_name": "TEST_Stranger"})
    assert w.status_code == 403
    # correct user
    c = requests.delete(f"{API}/reservations/{rid}", json={"user_name": "TEST_Owner"})
    assert c.status_code == 200
    # verify removed
    g = requests.get(f"{API}/reservations", params={"start_date": TEST_DATE, "end_date": TEST_DATE})
    assert rid not in [x["id"] for x in g.json()]


def test_queue_join_owner_rejected_and_duplicate_409():
    payload = {"user_name": "TEST_Queueowner", "date": TEST_DATE, "start_hour": 10, "duration": 1}
    r = requests.post(f"{API}/reservations", json=payload)
    assert r.status_code == 200
    rid = r.json()["id"]
    # owner rejected
    own = requests.post(f"{API}/reservations/{rid}/queue", json={"user_name": "TEST_Queueowner"})
    assert own.status_code == 400
    # first join
    j1 = requests.post(f"{API}/reservations/{rid}/queue", json={"user_name": "TEST_Joiner"})
    assert j1.status_code == 200
    assert "TEST_Joiner" in j1.json()["queue"]
    assert "_id" not in j1.json()
    # duplicate
    j2 = requests.post(f"{API}/reservations/{rid}/queue", json={"user_name": "TEST_Joiner"})
    assert j2.status_code == 409
    # leave
    lv = requests.delete(f"{API}/reservations/{rid}/queue", json={"user_name": "TEST_Joiner"})
    assert lv.status_code == 200
    assert "TEST_Joiner" not in lv.json()["queue"]
