from domains.event_rating import EventRating

class EventRatingService:
    def __init__(self, repository):
        self.repository = repository

    def create_event_rating(self, event_id: str, rating: int, comment: str):
        event_rating = EventRating(event_id, rating, comment)
        self.repository.add_event_rating(event_rating)

    def list_event_ratings(self):
        return self.repository.get_event_ratings()

    def get_event_rating(self, event_id: str):
        return self.repository.get_event_rating_by_event_id(event_id)
