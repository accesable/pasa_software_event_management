import sqlite3
import os
from contextlib import contextmanager

DB_PATH = "../../db/event_ratings.db"
def get_connection():
    # Define the database file path relative to the project root
    db_path = os.path.join(os.path.dirname(__file__), DB_PATH)
    db_path = os.path.abspath(db_path)  # Get the absolute path
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row  # Enable dict-like access
    return connection
@contextmanager
def get_db_connection():
    connection = get_connection()
    try:
        yield connection
    finally:
        connection.close()

    
def initialize_database():
    """Create the database schema if it doesn't exist."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)  # Ensure the data directory exists
    connection = get_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS event_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT NOT NULL UNIQUE,
                rating INTEGER NOT NULL,
                comment TEXT NOT NULL
            )
        """)
        connection.commit()
    finally:
        connection.close()
