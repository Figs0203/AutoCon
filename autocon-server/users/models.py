from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    SUPERVISOR_TECNICO = "SUPERVISOR_TECNICO"
    SOCIOS = "SOCIOS"

    ROLE_CHOICES = [
        (SUPERVISOR_TECNICO, "Supervisor Tecnico"),
        (SOCIOS, "Socios"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.email} - {self.role}"
