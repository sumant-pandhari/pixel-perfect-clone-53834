import uuid
from datetime import datetime, timezone
from database import db

class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(150), nullable=False)
    type = db.Column(db.String(50), nullable=False, default="Conference")
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.String(10), nullable=False)  # YYYY-MM-DD
    start_time = db.Column(db.String(8), nullable=True)  # HH:MM or HH:MM:SS
    end_time = db.Column(db.String(8), nullable=True)  # HH:MM or HH:MM:SS
    venue = db.Column(db.String(200), nullable=False, default="")
    organizer = db.Column(db.String(150), nullable=False, default="")
    expected_attendees = db.Column(db.Integer, nullable=False, default=0)
    budget = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(30), nullable=False, default="Upcoming")
    created_at = db.Column(
        db.String(50),
        nullable=False,
        default=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "description": self.description,
            "date": self.date,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "venue": self.venue,
            "organizer": self.organizer,
            "expected_attendees": self.expected_attendees,
            "budget": float(self.budget) if self.budget is not None else 0.0,
            "status": self.status,
            "created_at": self.created_at,
        }
