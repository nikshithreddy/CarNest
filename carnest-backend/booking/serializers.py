from rest_framework import serializers
from booking.models import BookingRide
from django.db.models import Sum

class BookingSerializer(serializers.ModelSerializer):
    driver_name = serializers.SerializerMethodField()
    going_to = serializers.SerializerMethodField()
    going_from = serializers.SerializerMethodField()
    Passenger_name = serializers.SerializerMethodField()
    ride_date = serializers.SerializerMethodField()
    selected_seats = serializers.SerializerMethodField()
    seats = serializers.ListField(write_only=True)

    class Meta:
        model = BookingRide
        fields = [
            'id', 'ride', 'passenger', 'status', 'additional_notes',
            'created_at', 'last_modified_date', 'total_price', 'driver_name', 'going_to',
            'going_from', 'Passenger_name', 'ride_date', 'booked_seat', 'selected_seats',
            'seats', 'chat',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'total_price',]

    def get_driver_name(self, obj):
        return obj.ride.driver.first_name + ' ' + obj.ride.driver.last_name

    def get_ride_date(self, obj):
        return obj.ride.date_time if obj.ride else None

    def get_going_to(self, obj):
        return obj.ride.going_to if obj.ride else None

    def get_going_from(self, obj):
        return obj.ride.going_from if obj.ride else None

    def get_Passenger_name(self, obj):
        return obj.passenger.first_name + ' ' + obj.passenger.last_name

    def validate(self, data):
        """
        Custom validation to ensure seat_1 is always true and no duplicate seat bookings.
        """
        ride = data.get('ride')
        seats = data.get('seats', [])
        booked_seats = ride.bookings.all()
        total_seats = ride.vehicle.number_of_seats - 1
        if ride is None or total_seats <= booked_seats.count():
            msg = "All seats are booked"
            raise serializers.ValidationError(msg)

        if 1 in seats or "1" in seats:
            msg = "Seat 1 is reserved for driver"
            raise serializers.ValidationError(msg)

        for seat in seats:
            if seat > 4:
                msg = "There are only 4 seats in the vehical"
                raise serializers.ValidationError(msg)

        if seats and booked_seats.filter(booked_seat__in=seats).exists():
            msg = "One of the seats is already booked"
            raise serializers.ValidationError(msg)
        
        if ride.driver == data.get('passenger'):
            msg = "Driver cannot book a ride"
            raise serializers.ValidationError(msg)

        return data


    def get_selected_seats(self, obj):
        """
        Map the seat fields to their respective human-readable labels.
        """
        selected_label = {
            'seat_2': False if obj.ride.bookings.all().filter(booked_seat=2).first() is None else "Front Right",
            'seat_3': False if obj.ride.bookings.all().filter(booked_seat=3).first() is None else "Back Left",
            'seat_4': False if obj.ride.bookings.all().filter(booked_seat=4).first() is None else "Back Right",
        }
        return [v for _, v in selected_label.items() if v]

    def create(self, validated_data):
        """
        Override create method to set the status to 'Confirmed' upon creation.
        """
        # Ensure the status is set to 'Confirmed'
        validated_data['status'] = 'Confirmed'
        seats = validated_data.pop("seats")

        for seat in seats:
            validated_data.update({
                "booked_seat": seat
            })
            booking_ride = BookingRide.objects.create(**validated_data)
        return booking_ride
    
class ChatSerializer(serializers.ModelSerializer):

    driver_name = serializers.ReadOnlyField(source="ride.driver.first_name")
    passenger_name = serializers.ReadOnlyField(source="passenger.first_name")
    driver_id = serializers.ReadOnlyField(source="ride.driver.id")
    passenger_id = serializers.ReadOnlyField(source="passenger.id")
    passenger_pic = serializers.SerializerMethodField()
    driver_pic = serializers.SerializerMethodField()
    

    class Meta:
        model = BookingRide
        fields = (
            "id",
            "driver_name",
            "passenger_name",
            "chat",
            "driver_pic",
            "passenger_pic",
            "driver_id",
            "passenger_id",
        )

    def get_passenger_pic(self, obj):
        if obj.passenger.profile_picture:
            return obj.passenger.profile_picture.url
        else:
            return None


    def get_driver_pic(self, obj):
        if obj.ride.driver.profile_picture:
            return obj.ride.driver.profile_picture.url
        else:
            return None