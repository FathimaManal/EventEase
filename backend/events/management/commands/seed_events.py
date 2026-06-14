from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from events.models import Event

SAMPLE_EVENTS = [
    {
        "title": "React + TypeScript Workshop",
        "description": "A hands-on workshop covering modern React with TypeScript, hooks, and state management patterns. Bring a laptop with Node.js installed.",
        "days_out": 7,
        "location": "Bangalore, India",
    },
    {
        "title": "Django Deep Dive: Building REST APIs",
        "description": "Spend a day mastering Django REST Framework — serializers, viewsets, authentication, permissions, and pagination.",
        "days_out": 14,
        "location": "Online (Zoom)",
    },
    {
        "title": "AI for Web Developers Summit",
        "description": "Talks and demos on integrating LLMs, RAG, and AI agents into modern web apps. Speakers from leading AI labs.",
        "days_out": 21,
        "location": "Mumbai, India",
    },
    {
        "title": "PostgreSQL Performance Bootcamp",
        "description": "Indexing strategies, query optimization, EXPLAIN ANALYZE, and connection pooling. For backend engineers.",
        "days_out": 28,
        "location": "Hyderabad, India",
    },
    {
        "title": "Open Source Saturday",
        "description": "Pair up with maintainers to make your first open source contribution. Bring an OSS project you'd like to contribute to.",
        "days_out": 5,
        "location": "Kochi, India",
    },
    {
        "title": "DevOps with Docker & Kubernetes",
        "description": "From containerizing your first app to running production-grade clusters. Practical labs included.",
        "days_out": 35,
        "location": "Online (Zoom)",
    },
    {
        "title": "Frontend Performance Audit Day",
        "description": "Profile real apps with Lighthouse and Chrome DevTools. Walk away with a measurable Core Web Vitals improvement plan.",
        "days_out": 10,
        "location": "Pune, India",
    },
    {
        "title": "Women in Tech Networking Evening",
        "description": "Casual evening of conversations, mentorship matching, and short lightning talks. Free dinner provided.",
        "days_out": 3,
        "location": "Bangalore, India",
    },
    {
        "title": "Intro to Machine Learning",
        "description": "A beginner-friendly introduction to ML — regression, classification, and a peek at neural networks. Math kept light.",
        "days_out": 18,
        "location": "Chennai, India",
    },
    {
        "title": "TypeScript at Scale",
        "description": "How large engineering teams structure TypeScript codebases — monorepos, type-driven design, and migration strategies.",
        "days_out": 42,
        "location": "Online (Zoom)",
    },
    {
        "title": "Startup Founder Mixer",
        "description": "Meet early-stage founders, investors, and operators. Five-minute pitches followed by structured networking.",
        "days_out": 12,
        "location": "Delhi, India",
    },
    {
        "title": "Accessibility-First Design Workshop",
        "description": "Build inclusive products from the start. WCAG, screen readers, keyboard navigation, and accessible color systems.",
        "days_out": 25,
        "location": "Bangalore, India",
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample events."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing events before seeding.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            deleted, _ = Event.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing events."))

        now = timezone.now()
        created = 0
        for sample in SAMPLE_EVENTS:
            _, was_created = Event.objects.get_or_create(
                title=sample["title"],
                defaults={
                    "description": sample["description"],
                    "date": now + timedelta(days=sample["days_out"]),
                    "location": sample["location"],
                },
            )
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f"Seeded {created} new events ({len(SAMPLE_EVENTS)} total)."))
