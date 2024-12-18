from rest_framework import serializers
from rides.models import Ride
from booking.serializers import BookingSerializer
from rides.utils import  get_distance_from_google_maps, get_duration_from_google_maps

class RideSerializer(serializers.ModelSerializer):
    available_seats = serializers.SerializerMethodField()
    vehicle_name = serializers.SerializerMethodField()
    vehicle_color = serializers.SerializerMethodField()
    driver_name = serializers.SerializerMethodField()
    within_distance = serializers.SerializerMethodField()
    within_time = serializers.SerializerMethodField()
    passengers = serializers.SerializerMethodField()
    total_number_of_seats = serializers.SerializerMethodField()
    driver_profile_pic = serializers.SerializerMethodField()


    class Meta:
        model = Ride
        fields = [
            'id', 
            'vehicle', 
            'driver', 
            'going_from', 
            'going_to', 
            'date_time', 
            'price_per_seat', 
            'available_seats', 
            'ride_description', 
            'driver_profile_pic',
            'created_date', 
            'last_modified_date',
            'vehicle_name',
            'driver_name',
            'vehicle_color',
            'going_from_lat', 
            'going_from_lng', 
            'going_to_lat', 
            'going_to_lng',
            'within_distance',
            'within_time',
            'passengers',
            'total_number_of_seats',
            'going_to_within',
            'going_from_within',
        ]

    def get_driver_name(self, obj):
        first_name = obj.driver.first_name if obj.driver else None
        last_name = obj.driver.last_name if obj.driver else None
        return f"{first_name} {last_name}" if first_name and last_name else None
    
    def get_driver_profile_pic(self, obj):
        if obj.driver and hasattr(obj.driver, 'profile_picture') and obj.driver.profile_picture:
            return obj.driver.profile_picture.url
        return None
    
    def get_available_seats(self, obj):
        total_seats = obj.vehicle.number_of_seats - 1
        booked_seats = obj.bookings.all().count()
        return total_seats - booked_seats
    
    def get_total_number_of_seats(self, obj):
        return obj.vehicle.number_of_seats - 1 if obj.vehicle else None
    
    def get_vehicle_name(self, obj):
        make = obj.vehicle.make if obj.vehicle else None
        model = obj.vehicle.model if obj.vehicle else None
        return f"{make} {model}" if make and model else None
    
    def get_vehicle_color(self, obj):
        return obj.vehicle.color if obj.vehicle else None
    

    def get_within_distance(self, obj):
        distance = get_distance_from_google_maps(obj.going_from_lat, obj.going_from_lng, obj.going_to_lat, obj.going_to_lng)
        return distance if distance is not None else "N/A"

    def get_passengers(self, obj):
        return BookingSerializer(obj.bookings.all(), many=True).data
    
    def get_within_time(self, obj):
        time = get_duration_from_google_maps(obj.going_from_lat, obj.going_from_lng, obj.going_to_lat, obj.going_to_lng)
        return time if time is not None else "N/A"
    
    def create(self, validated_data):
        
        request = self.context.get('request')
        validated_data['driver'] = request.user
        return super().create(validated_data)