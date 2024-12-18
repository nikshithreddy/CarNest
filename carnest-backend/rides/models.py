# models.py
import uuid
from django.db import models
from users.models import User
from vehicle.models import Vehicle


class Ride(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="rides")
    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="driven_rides")
    going_from = models.CharField(max_length=255)
    going_to = models.CharField(max_length=255)
    date_time = models.DateTimeField()
    price_per_seat = models.DecimalField(max_digits=10, decimal_places=2)
    ride_description = models.TextField(blank=True, null=True)
    going_from_lat = models.FloatField(null=True, blank=True)
    going_from_lng = models.FloatField(null=True, blank=True)
    going_to_lat = models.FloatField(null=True, blank=True)
    going_to_lng = models.FloatField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    last_modified_date = models.DateTimeField(auto_now=True)
    going_to_within = models.FloatField(null=True, blank=True)
    going_from_within = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Ride from {self.going_from} to {self.going_to} by {self.driver.first_name}"
    
