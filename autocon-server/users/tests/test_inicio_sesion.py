import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from users.models import UserProfile

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestInicioSesion:
    """
    Casos de prueba para inicio de sesión (users/login/).
    """

    def setup_method(self):
        self.client = APIClient()
        self.login_url = "/users/login/"
        self.me_url = "/users/me/"

        self.email = "testuser@tipinterventoria.com"
        self.password = "correct_password"

        self.user = User.objects.create_user(
            username=self.email,
            email=self.email,
            password=self.password,
        )
        UserProfile.objects.create(user=self.user, role=UserProfile.SUPERVISOR_TECNICO)

    # ---------------------------------------------------------------
    # CP-06 — Happy Path: login exitoso
    # ---------------------------------------------------------------
    def test_CP06_login_success(self):
        """
        CP-06 - Happy Path:
        El usuario puede iniciar sesión con credenciales válidas.
        """
        payload = {"email": self.email, "password": self.password}

        response = self.client.post(self.login_url, payload, format="json")

        assert response.status_code == 200
        assert "token" in response.data
        assert "user" in response.data
        assert response.data["user"]["email"] == self.email
        assert response.data["user"]["role"] == UserProfile.SUPERVISOR_TECNICO

    # ---------------------------------------------------------------
    # CP-16 — Flujo alternativo: credenciales inválidas
    # ---------------------------------------------------------------
    def test_CP16_login_invalid_credentials(self):
        """
        CP-16 - Flujo alternativo:
        El sistema rechaza credenciales incorrectas.

        Nota: este backend responde 400 (no 401) cuando el serializer invalida.
        """
        payload = {"email": self.email, "password": "wrong_password"}

        response = self.client.post(self.login_url, payload, format="json")

        assert response.status_code == 400
        assert "credenciales" in str(response.data).lower()

    # ---------------------------------------------------------------
    # Flujo alternativo: campos vacíos
    # ---------------------------------------------------------------
    def test_login_empty_fields(self):
        """
        Flujo alternativo:
        El sistema no permite iniciar sesión con campos vacíos.
        """
        payload = {"email": "", "password": ""}

        response = self.client.post(self.login_url, payload, format="json")

        assert response.status_code == 400
        assert "email" in response.data
        assert "password" in response.data

    # ---------------------------------------------------------------
    # Happy Path: persistencia de sesión con token
    # ---------------------------------------------------------------
    def test_login_session_persistence(self):
        """
        Happy Path:
        El token retornado permite acceder a un recurso protegido (GET /users/me/).
        """
        payload = {"email": self.email, "password": self.password}

        login_response = self.client.post(self.login_url, payload, format="json")
        assert login_response.status_code == 200
        token = login_response.data["token"]

        # En AutoCon la autenticación es "Token <key>", no Bearer.
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        response = self.client.get(self.me_url)

        assert response.status_code == 200
        assert response.data["email"] == self.email
