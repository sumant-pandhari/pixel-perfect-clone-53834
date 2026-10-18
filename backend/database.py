import os
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    """
    Ensures the instance directory exists and creates all database tables.
    The database starts empty with no seeded sample records as requested.
    """
    os.makedirs(app.instance_path, exist_ok=True)
    with app.app_context():
        db.create_all()
