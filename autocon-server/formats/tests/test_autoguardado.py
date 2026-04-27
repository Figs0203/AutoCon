import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from users.models import UserProfile

from ..models import FormatoTecnico, FormularioInstancia

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestAutoGuardadoFormulario:
    """
    HU-14 — Guardado automático del formulario (backend).

    En este proyecto el "autoguardado" del lado servidor es un UPDATE de la instancia:
    - GET /formats/submissions/<pk>/  -> recuperar progreso
    - PUT /formats/submissions/<pk>/  -> guardar cambios (datos/estado)
    """

    def setup_method(self):
        self.user = User.objects.create_user(username="test", password="1234")
        UserProfile.objects.create(user=self.user, role=UserProfile.SUPERVISOR_TECNICO)

        self.formato = FormatoTecnico.objects.create(
            nombre="Formato prueba",
            codigo="FOR-TEST",
            schema={"secciones": []},
            activo=True,
        )

        self.instancia = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.user,
            datos={"campo": "valor inicial"},
            estado=FormularioInstancia.BORRADOR,
        )

    def _client(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        return client

    # ---------------------------------------------------------------
    # CP-09 — Guardado automático (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP09_autoguardado_exitoso(self):
        """El sistema guarda automáticamente los cambios del formulario."""
        client = self._client()
        url = f"/formats/submissions/{self.instancia.pk}/"
        data = {"datos": {"campo": "nuevo valor"}, "estado": FormularioInstancia.BORRADOR}

        response = client.put(url, data, format="json")

        assert response.status_code == 200
        self.instancia.refresh_from_db()
        assert self.instancia.datos["campo"] == "nuevo valor"

    # ---------------------------------------------------------------
    # CP-11 — Recuperar progreso guardado (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP11_recuperar_progreso(self):
        """El sistema recupera el progreso guardado al reabrir la instancia."""
        client = self._client()
        url = f"/formats/submissions/{self.instancia.pk}/"

        response = client.get(url)

        assert response.status_code == 200
        assert "datos" in response.data
        assert response.data["datos"]["campo"] == "valor inicial"
        assert "imagenes" in response.data

    # ---------------------------------------------------------------
    #  Error en guardado automático 
    # ---------------------------------------------------------------
    def test_error_autoguardado_id_invalido(self):
        """El sistema responde 404 si se intenta guardar una instancia inexistente."""
        client = self._client()
        url = "/formats/submissions/999999/"
        response = client.put(url, {"datos": {"campo": "valor"}}, format="json")

        assert response.status_code == 404
        assert "error" in response.data

    # ---------------------------------------------------------------
    # CP-19 — Persistencia tras cierre/reapertura (FLUJO ALTERNATIVO)
    # ---------------------------------------------------------------
    def test_CP19_persistencia_datos(self):
        """
        Simula cierre inesperado: el usuario guarda y luego "vuelve a entrar".
        Los datos deben seguir en la base de datos.
        """
        client = self._client()
        url = f"/formats/submissions/{self.instancia.pk}/"
        data = {"datos": {"campo": "guardado antes de cerrar"}}

        response = client.put(url, data, format="json")
        assert response.status_code == 200

        # "Cerrar y volver": nuevo client con el mismo token.
        client2 = self._client()
        response = client2.get(url)

        assert response.status_code == 200
        assert response.data["datos"]["campo"] == "guardado antes de cerrar"
