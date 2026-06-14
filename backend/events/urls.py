from django.urls import path

from .views import (
    EventDetailView,
    EventListView,
    EventRegisterView,
    MyRegistrationsView,
)

urlpatterns = [
    path("events", EventListView.as_view(), name="event-list"),
    path("events/<int:pk>", EventDetailView.as_view(), name="event-detail"),
    path("events/<int:pk>/register", EventRegisterView.as_view(), name="event-register"),
    path("my-registrations", MyRegistrationsView.as_view(), name="my-registrations"),
]
