import os
import json
import unittest
from app import create_app
from database import db
from models import Event

class EventSphereBackendTestCase(unittest.TestCase):
    def setUp(self):
        # Create a test instance with in-memory database
        self.app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        })
        self.client = self.app.test_client()

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "healthy")

    def test_initial_db_is_empty(self):
        """Adjustment 1: Database should start empty."""
        response = self.client.get("/api/events")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data, [])

    def test_crud_lifecycle(self):
        """Test full Create -> Read -> Update -> Delete lifecycle."""
        # 1. CREATE
        new_event = {
            "name": "Infosys AI & Cloud Conclave 2026",
            "type": "Conference",
            "description": "Annual summit on cloud innovation and generative AI.",
            "date": "2026-11-20",
            "start_time": "09:30",
            "end_time": "17:00",
            "venue": "Infosys Convention Hall, Bengaluru",
            "organizer": "Infosys Springboard",
            "expected_attendees": 500,
            "budget": 250000.0,
            "status": "Upcoming",
        }
        res_create = self.client.post("/api/events", json=new_event)
        self.assertEqual(res_create.status_code, 201)
        created = res_create.get_json()

        # Check all 13 fields
        required_fields = [
            "id", "name", "type", "description", "date", "start_time",
            "end_time", "venue", "organizer", "expected_attendees",
            "budget", "status", "created_at"
        ]
        for field in required_fields:
            self.assertIn(field, created)

        self.assertEqual(created["name"], new_event["name"])
        self.assertEqual(created["type"], new_event["type"])
        self.assertEqual(created["venue"], new_event["venue"])
        self.assertEqual(created["organizer"], new_event["organizer"])
        self.assertEqual(created["expected_attendees"], 500)
        self.assertEqual(created["budget"], 250000.0)
        self.assertEqual(created["status"], "Upcoming")
        event_id = created["id"]

        # 2. READ (all)
        res_all = self.client.get("/api/events")
        self.assertEqual(res_all.status_code, 200)
        events_list = res_all.get_json()
        self.assertEqual(len(events_list), 1)
        self.assertEqual(events_list[0]["id"], event_id)

        # 3. READ (single by ID)
        res_single = self.client.get(f"/api/events/{event_id}")
        self.assertEqual(res_single.status_code, 200)
        single = res_single.get_json()
        self.assertEqual(single["name"], new_event["name"])

        # 4. UPDATE (PUT)
        update_data = {
            "name": "Infosys AI & Cloud Global Conclave 2026",
            "status": "Completed",
            "expected_attendees": 650,
            "budget": 275000.0,
        }
        res_update = self.client.put(f"/api/events/{event_id}", json=update_data)
        self.assertEqual(res_update.status_code, 200)
        updated = res_update.get_json()
        self.assertEqual(updated["name"], update_data["name"])
        self.assertEqual(updated["status"], "Completed")
        self.assertEqual(updated["expected_attendees"], 650)
        self.assertEqual(updated["budget"], 275000.0)
        # Verify unchanged fields remain
        self.assertEqual(updated["venue"], new_event["venue"])

        # 5. DELETE
        res_delete = self.client.delete(f"/api/events/{event_id}")
        self.assertEqual(res_delete.status_code, 200)

        # Verify not found after delete
        res_after = self.client.get(f"/api/events/{event_id}")
        self.assertEqual(res_after.status_code, 404)

        res_all_after = self.client.get("/api/events")
        self.assertEqual(res_all_after.status_code, 200)
        self.assertEqual(res_all_after.get_json(), [])

    def test_validation(self):
        # Missing name
        res = self.client.post("/api/events", json={"date": "2026-11-20"})
        self.assertEqual(res.status_code, 400)

        # Missing date
        res = self.client.post("/api/events", json={"name": "Test Event"})
        self.assertEqual(res.status_code, 400)

        # End time before start time
        res = self.client.post("/api/events", json={
            "name": "Invalid Time Event",
            "date": "2026-11-20",
            "start_time": "18:00",
            "end_time": "10:00"
        })
        self.assertEqual(res.status_code, 400)

        # 404 for non-existent event
        res = self.client.get("/api/events/non-existent-id")
        self.assertEqual(res.status_code, 404)

if __name__ == "__main__":
    unittest.main()
