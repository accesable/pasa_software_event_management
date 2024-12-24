from domains.event_rating import EventRating

class EventRatingRepository:
    def __init__(self, connection):
        self.connection = connection

    def add_event_rating(self, event_rating: EventRating):
        with self.connection as connection:  # Use context manager for connection
            cursor = connection.cursor()
            cursor.execute("""
                INSERT INTO event_ratings (event_id, rating, comment)
                VALUES (?, ?, ?)
            """, (event_rating.event_id, event_rating.rating, event_rating.comment))
            connection.commit()

    def get_event_ratings(self):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM event_ratings")
        rows = cursor.fetchall()
        return [EventRating(row["event_id"], row["rating"], row["comment"]) for row in rows]

    def get_event_rating_by_event_id(self, event_id: str):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM event_ratings WHERE event_id = ?", (event_id,))
        row = cursor.fetchone()
        if row:
            return EventRating(row["event_id"], row["rating"], row["comment"])
        return None
