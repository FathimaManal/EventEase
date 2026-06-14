from django.contrib import admin

from .models import Event, Registration


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "date", "location", "created_at")
    list_filter = ("date", "location")
    search_fields = ("title", "description", "location")
    ordering = ("date",)


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ("user", "event", "registered_at")
    list_filter = ("registered_at",)
    search_fields = ("user__email", "event__title")
    autocomplete_fields = ("user", "event")
