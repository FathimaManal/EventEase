from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event, Registration
from .serializers import EventSerializer, RegistrationSerializer


class EventListView(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (AllowAny,)
    search_fields = ("title", "description", "location")
    ordering_fields = ("date", "created_at", "title")
    ordering = ("date",)


class EventDetailView(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (AllowAny,)


class EventRegisterView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        event = get_object_or_404(Event, pk=pk)
        registration, created = Registration.objects.get_or_create(
            user=request.user, event=event
        )
        if not created:
            return Response(
                {"detail": "You are already registered for this event."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            RegistrationSerializer(registration).data,
            status=status.HTTP_201_CREATED,
        )


class MyRegistrationsView(generics.ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = (IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        return (
            Registration.objects
            .filter(user=self.request.user)
            .select_related("event")
            .order_by("-registered_at")
        )
