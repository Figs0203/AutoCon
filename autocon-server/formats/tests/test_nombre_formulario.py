import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from users.models import UserProfile

from ..models import FormatoTecnico, FormularioInstancia

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestNombreFormulario:
    """
    HU — Editar nombre de formulario (nombre_personalizado).

    Backend real:
    - Crear instancia:  POST /formats/submit/  (puede incluir nombre_personalizado)
    - Editar instancia: PUT  /formats/submissions/<pk>/  (puede incluir nombre_personalizado)
    - Historial/listado: GET /formats/submissions/  (retorna "titulo" = nombre_personalizado o nombre del formato)

    Nota:
    - La validación de nombre_personalizado está implementada en POST /formats/submit/.
    - Si más adelante deseas exigir la validación también en PUT, el test CP-20 sirve como evidencia.
    """

    def setup_method(self):
        self.user = User.objects.create_user(username="test", password="1234")
        UserProfile.objects.create(user=self.user, role=UserProfile.SUPERVISOR_TECNICO)

        self.formato = FormatoTecnico.objects.create(
            nombre="Formato Inicial",
            codigo="FOR-001",
            schema={"secciones": []},
            activo=True,
        )

    def _client(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        return client

    def _crear_instancia(self, nombre_personalizado=None):
        client = self._client()
        payload = {
            "formato": self.formato.pk,
            "estado": FormularioInstancia.BORRADOR,
            "datos": {},
        }
        if nombre_personalizado is not None:
            payload["nombre_personalizado"] = nombre_personalizado

        response = client.post("/formats/submit/", payload, format="json")
        assert response.status_code == 201
        return response.data["id"]

    # ---------------------------------------------------------------
    # CP-16 — Editar nombre antes de guardar (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP16_editar_nombre_antes_guardar(self):
        """
        Se interpreta como: el usuario puede asignar nombre_personalizado al crear (antes de persistir).
        """
        client = self._client()
        nuevo_nombre = "Nuevo Nombre Antes"
        payload = {
            "formato": self.formato.pk,
            "estado": FormularioInstancia.BORRADOR,
            "datos": {},
            "nombre_personalizado": nuevo_nombre,
        }

        response = client.post("/formats/submit/", payload, format="json")

        assert response.status_code == 201
        instancia_id = response.data["id"]
        instancia = FormularioInstancia.objects.get(pk=instancia_id)
        assert instancia.nombre_personalizado == nuevo_nombre

    # ---------------------------------------------------------------
    # CP-17 — Editar nombre después de guardar (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP17_editar_nombre_despues_guardar(self):
        client = self._client()
        instancia_id = self._crear_instancia()
        url = f"/formats/submissions/{instancia_id}/"

        nuevo_nombre = "Nombre Editado Final"
        response = client.put(
            url,
            {"nombre_personalizado": nuevo_nombre, "datos": {}, "estado": "BORRADOR"},
            format="json",
        )

        assert response.status_code == 200
        instancia = FormularioInstancia.objects.get(pk=instancia_id)
        assert instancia.nombre_personalizado == nuevo_nombre

    # ---------------------------------------------------------------
    # CP-18 — Validación de nombre inválido (FLUJO ALTERNATIVO)
    # ---------------------------------------------------------------
    def test_CP18_nombre_invalido_vacio(self):
        """
        Al crear (POST /formats/submit/) el backend valida vacío/longitud/caracteres.
        """
        client = self._client()
        payload = {
            "formato": self.formato.pk,
            "estado": FormularioInstancia.BORRADOR,
            "datos": {},
            "nombre_personalizado": "   ",
        }

        response = client.post("/formats/submit/", payload, format="json")

        assert response.status_code == 400
        assert "detail" in response.data
        assert "no puede estar vacío" in str(response.data["detail"]).lower()

    # ---------------------------------------------------------------
    # CP-19 — Reflejo en historial/listados (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP19_nombre_reflejado_historial(self):
        client = self._client()
        instancia_id = self._crear_instancia()
        nuevo_nombre = "Formulario Obra Norte"

        response = client.put(
            f"/formats/submissions/{instancia_id}/",
            {"nombre_personalizado": nuevo_nombre, "datos": {}, "estado": "BORRADOR"},
            format="json",
        )
        assert response.status_code == 200

        response = client.get("/formats/submissions/")

        assert response.status_code == 200
        item = next((x for x in response.data if x["id"] == instancia_id), None)
        assert item is not None
        assert item["titulo"] == nuevo_nombre

    # ---------------------------------------------------------------
    # CP-20 — Validación estricta (posible fallo)
    # ---------------------------------------------------------------
    def test_CP20_nombre_caracteres_especiales(self):
        """
        Si el backend valida caracteres también al actualizar, debe rechazar "@@@###$$$".
        """
        client = self._client()
        instancia_id = self._crear_instancia()

        response = client.put(
            f"/formats/submissions/{instancia_id}/",
            {"nombre_personalizado": "@@@###$$$", "datos": {}, "estado": "BORRADOR"},
            format="json",
        )

        assert response.status_code == 400
        assert "detail" in response.data
        assert "caracteres" in str(response.data["detail"]).lower()
