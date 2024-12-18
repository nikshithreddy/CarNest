from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import BookingRide
from booking.serializers import BookingSerializer, ChatSerializer
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView
from django.db.models import Q


class BookingRideViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing ride bookings.
    """

    queryset = BookingRide.objects.all()
    serializer_class = BookingSerializer

    def get_queryset(self):
        """
        Limits the queryset to bookings made by the authenticated user or the driver of the ride.
        """
        user = self.request.user
        return BookingRide.objects.filter(passenger=user)

    @action(detail=False, methods=["delete"], permission_classes=[IsAuthenticated])
    def delete_all_bookings(self, request):
        """
        Custom action to delete all bookings.
        """
        try:
            # Delete all bookings
            count, _ = BookingRide.objects.all().delete()

            return Response(
                {"message": f"{count} bookings deleted."}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def cancel_ride(self, request, pk=None):
        """
        Custom action to cancel a specific booking by changing its status to 'Cancelled'.
        """
        booking = self.get_object()

        # Check if the booking is already cancelled
        if not booking:
            return Response(
                {"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND
            )
        # Delete the booking
        booking.delete()
        return Response(
            {"detail": "Booking has been cancelled successfully."},
            status=status.HTTP_200_OK,
        )


class Chat(ListAPIView):

    queryset = BookingRide.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(
            Q(ride__driver=self.request.user) | Q(passenger=self.request.user)
        )

