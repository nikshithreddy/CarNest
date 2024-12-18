from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Vehicle
from .serializers import VehicleSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

class VehicleViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing, editing, and deleting Vehicle instances.
    """
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """
        Automatically assign the current user as the owner.
        """
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        """
        Ensure the user can only access their own vehicles.
        """
        return Vehicle.objects.filter(owner=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        """
        Custom handler for PATCH requests to update a vehicle.
        """
        try:
            vehicle = self.get_queryset().get(pk=kwargs['pk'])
        except Vehicle.DoesNotExist:
            raise NotFound({"detail": "Vehicle not found."})

        serializer = self.get_serializer(vehicle, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Custom handler for DELETE requests to delete a vehicle by ID.
        """
        try:
            vehicle = self.get_queryset().get(pk=kwargs['pk'])
        except Vehicle.DoesNotExist:
            raise NotFound({"detail": "Vehicle not found."})

        vehicle.delete()
        return Response(
            {"detail": "Vehicle deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
