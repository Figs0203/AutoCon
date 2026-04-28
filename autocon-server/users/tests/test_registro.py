import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from users.models import UserProfile

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestRegistro:

    def setup_method(self):
        self.client = APIClient()
        self.register_url = "/users/register/"

    # ---------------------------------------------------------------
    # CP-01 Registro exitoso
    # ---------------------------------------------------------------
    def test_CP01_register_success(self):
        """
        CP-01 - Happy Path:
        El sistema registra correctamente un usuario con datos válidos.
        """
        payload = {
            "email": "usuario@tipinterventoria.com",
            "password": "securepass123",
            "role": UserProfile.SUPERVISOR_TECNICO,
        }

        response = self.client.post(self.register_url, payload, format="json")

        assert response.status_code == 201
        assert "token" in response.data
        assert "user" in response.data
        assert response.data["user"]["email"] == payload["email"]
        assert response.data["user"]["role"] == payload["role"]
        assert User.objects.filter(email=payload["email"]).exists()

    # ---------------------------------------------------------------
    # Redirección de lógica a login
    # ---------------------------------------------------------------
    def test_register_redirect_to_login(self):
        """
        Happy Path:
        Después del registro, el sistema permite autenticación.

        """
        payload = {
            "email": "nuevo@tipinterventoria.com",
            "password": "securepass123",
            "role": UserProfile.SUPERVISOR_TECNICO,
        }

        response = self.client.post(self.register_url, payload, format="json")

        assert response.status_code == 201
        assert "token" in response.data
        assert "user" in response.data

    # ---------------------------------------------------------------
    # CP-02 — Flujo alternativo: dominio inválido
    # ---------------------------------------------------------------
    def test_CP02_register_invalid_email_domain(self):
        """
        CP-02 - Flujo alternativo:
        No permite registro con dominio distinto a tipinterventoria.com
        """
        payload = {
            "email": "usuario@gmail.com",
            "password": "securepass123",
            "role": UserProfile.SUPERVISOR_TECNICO,
        }

        response = self.client.post(self.register_url, payload, format="json")

        assert response.status_code == 400
        assert "email" in response.data

    # ---------------------------------------------------------------
    # CP-02 — Flujo alternativo: contraseña corta
    # ---------------------------------------------------------------
    def test_CP02_register_short_password(self):
        """
        CP-02 - Flujo alternativo:
        No permite contraseñas menores a 8 caracteres.
        """
        payload = {
            "email": "usuario2@tipinterventoria.com",
            "password": "123",
            "role": UserProfile.SUPERVISOR_TECNICO,
        }

        response = self.client.post(self.register_url, payload, format="json")

        assert response.status_code == 400
        assert "password" in response.data
