from django.db import models
from rides.models import Ride
from users.models import User
import uuid
from notifications.helpers import send_notification
from notifications.models import get_default_content_type

def get_booking_confirmation_msg(booking):
    subject = "Your booking has been confirmed"
    msg = f"""Your booking from {booking.ride.going_from} to {booking.ride.going_to} has been confirmed for the date: {booking.ride.date_time}"""
    return subject, msg

class BookingRide(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
    ]

    SEAT_CHOICES = [
        ('1', 'Driver'),
        ('2', 'Front Right'),
        ('3', 'Back Left'),
        ('4', 'Back Right'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name="bookings")
    passenger = models.ForeignKey(User, on_delete=models.CASCADE, related_name="booked_rides")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    additional_notes = models.TextField(blank=True, null=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_date = models.DateTimeField(auto_now=True)
    chat = models.TextField(default=[])

    # Seat selection fields
    booked_seat = models.CharField(max_length=4, choices=SEAT_CHOICES, null=True, default=None, blank=True)

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.ride.price_per_seat

        # Send email Notification
        subject, msg = get_booking_confirmation_msg(self)
        send_notification(
            content_type=get_default_content_type(BookingRide),
            object_id=self.id,
            subject=subject,
            message=msg,
            to=self.passenger,
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking by {self.passenger.email} for {self.ride}"
