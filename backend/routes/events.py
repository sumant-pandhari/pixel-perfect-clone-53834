from flask import Blueprint, request, jsonify
from database import db
from models import Event

events_bp = Blueprint("events", __name__, url_prefix="/api/events")

VALID_STATUSES = {"Upcoming", "Completed", "Cancelled"}
VALID_TYPES = {
    "Conference",
    "Wedding",
    "Corporate",
    "Concert",
    "Workshop",
    "Birthday",
    "Exhibition",
    "Other",
}

@events_bp.route("", methods=["GET"])
@events_bp.route("/", methods=["GET"])
def get_events():
    """
    Fetch events ordered by date ascending.
    Supports optional query filters:
      - search: filter by name substring (case-insensitive)
      - status: filter by status (Upcoming, Completed, Cancelled)
    """
    query = Event.query

    status_filter = request.args.get("status")
    if status_filter and status_filter != "All":
        query = query.filter(Event.status == status_filter)

    search_query = request.args.get("search")
    if search_query:
        query = query.filter(Event.name.ilike(f"%{search_query.strip()}%"))

    # Order by date ascending, then start_time
    events = query.order_by(Event.date.asc(), Event.start_time.asc()).all()
    return jsonify([event.to_dict() for event in events]), 200


@events_bp.route("/<string:event_id>", methods=["GET"])
def get_event(event_id):
    """
    Fetch a single event by ID.
    Returns 404 if not found.
    """
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    return jsonify(event.to_dict()), 200


@events_bp.route("", methods=["POST"])
@events_bp.route("/", methods=["POST"])
def create_event():
    """
    Create a new event.
    Validates required fields: name, date.
    Returns 201 with the created event JSON.
    """
    data = request.get_json()
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request body. JSON object required."}), 400

    name = data.get("name", "").strip() if isinstance(data.get("name"), str) else ""
    if not name:
        return jsonify({"error": "Event name is required."}), 400

    date = data.get("date", "").strip() if isinstance(data.get("date"), str) else ""
    if not date:
        return jsonify({"error": "Event date is required."}), 400

    event_type = data.get("type", "Conference")
    if event_type not in VALID_TYPES:
        event_type = "Other"

    status = data.get("status", "Upcoming")
    if status not in VALID_STATUSES:
        status = "Upcoming"

    start_time = data.get("start_time") or None
    end_time = data.get("end_time") or None
    if start_time and end_time and end_time <= start_time:
        return jsonify({"error": "End time must be after start time."}), 400

    try:
        expected_attendees = int(data.get("expected_attendees", 0) or 0)
        if expected_attendees < 0:
            expected_attendees = 0
    except (ValueError, TypeError):
        return jsonify({"error": "Expected attendees must be a valid number."}), 400

    try:
        budget = float(data.get("budget", 0.0) or 0.0)
        if budget < 0:
            budget = 0.0
    except (ValueError, TypeError):
        return jsonify({"error": "Budget must be a valid number."}), 400

    event = Event(
        name=name,
        type=event_type,
        description=data.get("description", "").strip() if data.get("description") else None,
        date=date,
        start_time=start_time,
        end_time=end_time,
        venue=data.get("venue", "").strip() if data.get("venue") else "",
        organizer=data.get("organizer", "").strip() if data.get("organizer") else "",
        expected_attendees=expected_attendees,
        budget=budget,
        status=status,
    )

    db.session.add(event)
    db.session.commit()

    return jsonify(event.to_dict()), 201


@events_bp.route("/<string:event_id>", methods=["PUT"])
def update_event(event_id):
    """
    Update an existing event by ID.
    Returns 200 with updated event or 404 if not found.
    """
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    data = request.get_json()
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request body. JSON object required."}), 400

    if "name" in data:
        name = data.get("name", "").strip() if isinstance(data.get("name"), str) else ""
        if not name:
            return jsonify({"error": "Event name cannot be empty."}), 400
        event.name = name

    if "date" in data:
        date = data.get("date", "").strip() if isinstance(data.get("date"), str) else ""
        if not date:
            return jsonify({"error": "Event date cannot be empty."}), 400
        event.date = date

    if "type" in data:
        event_type = data.get("type")
        if event_type in VALID_TYPES:
            event.type = event_type

    if "status" in data:
        status = data.get("status")
        if status in VALID_STATUSES:
            event.status = status

    if "description" in data:
        desc = data.get("description")
        event.description = desc.strip() if isinstance(desc, str) and desc.strip() else None

    if "venue" in data:
        event.venue = data.get("venue", "").strip() if data.get("venue") else ""

    if "organizer" in data:
        event.organizer = data.get("organizer", "").strip() if data.get("organizer") else ""

    start_time = data.get("start_time") if "start_time" in data else event.start_time
    end_time = data.get("end_time") if "end_time" in data else event.end_time
    if start_time and end_time and end_time <= start_time:
        return jsonify({"error": "End time must be after start time."}), 400
    if "start_time" in data:
        event.start_time = data.get("start_time") or None
    if "end_time" in data:
        event.end_time = data.get("end_time") or None

    if "expected_attendees" in data:
        try:
            val = int(data.get("expected_attendees", 0) or 0)
            event.expected_attendees = max(0, val)
        except (ValueError, TypeError):
            return jsonify({"error": "Expected attendees must be an integer."}), 400

    if "budget" in data:
        try:
            b_val = float(data.get("budget", 0.0) or 0.0)
            event.budget = max(0.0, b_val)
        except (ValueError, TypeError):
            return jsonify({"error": "Budget must be a valid number."}), 400

    db.session.commit()
    return jsonify(event.to_dict()), 200


@events_bp.route("/<string:event_id>", methods=["DELETE"])
def delete_event(event_id):
    """
    Delete an event by ID.
    Returns 200 with confirmation or 404 if not found.
    """
    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted successfully", "id": event_id}), 200
