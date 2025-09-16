from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ("patient", "Patient"),
        ("doctor", "Doctor"),
        ("admin", "Admin"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="patient")
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

class Doctor(models.Model):
    name = models.CharField(max_length=100)
    speciality = models.CharField(max_length=200)
    therapy = models.CharField(max_length=100)
    available_days = models.CharField(max_length=100, default="Mon-Fri")  # e.g. "Mon-Fri"
    available_time = models.CharField(max_length=100, default="10:00 AM - 5:00 PM")

    def __str__(self):
        return f"{self.name} ({self.speciality})"