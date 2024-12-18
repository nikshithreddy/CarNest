from django.db import models
from users.models import User

class Vehicle(models.Model):
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vehicle")
    make = models.CharField(max_length=100) 
    model = models.CharField(max_length=100)  
    year = models.PositiveIntegerField() 
    plate_number = models.CharField(max_length=50, unique=True)  
    color = models.CharField(max_length=30, blank=True, null=True)  
    number_of_seats = models.PositiveIntegerField() 
    created_date = models.DateTimeField(auto_now_add=True)    
    last_modified_date = models.DateTimeField(auto_now=True)
    state= models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.make} {self.model} ({self.plate_number})"

    def get_vehicle_name(self):
        return f"{self.make} {self.model}"

    @property
    def available_seats(self):
        # Calculate available seats by subtracting booked seats from total seats
        # booked_seats = sum(ride.number_of_seats for ride in self.rides.filter(status='Confirmed'))
        return self.number_of_seats