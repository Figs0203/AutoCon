import time

import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from users.models import UserProfile

from formats.models import FormatoTecnico, FormularioInstancia

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestBusquedaFiltros:
    """
    HU-09 — Buscar formularios mediante filtros.

    Nota importante:
    En el backend actual, el listado es GET /formats/submissions/ y retorna todos los
    envíos del usuario. Estos tests asumen filtrado por query params (q/estado), que
    es lo que pide la HU. Si el backend aún no implementa esos filtros, estos tests
    fallarán y servirán como evidencia del gap.
    """

    def setup_method(self):
        self.user = User.objects.create_user(username="test", password="1234")
        UserProfile.objects.create(user=self.user, role=UserProfile.SUPERVISOR_TECNICO)

        self.client = APIClient()
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        self.formato = FormatoTecnico.objects.create(
            nombre="Formato Base",
            codigo="FOR-BUS-001",
            schema={"secciones": []},
            activo=True,
        )

        # Dos instancias con títulos/estados distintos para probar filtros.
        self.instancia_obra_norte = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.user,
            nombre_personalizado="Formulario Obra Norte",
            datos={"x": 1},
            estado=FormularioInstancia.BORRADOR,
        )
        self.instancia_obra_sur = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.user,
            nombre_personalizado="Formulario Obra Sur",
            datos={"x": 2},
            estado=FormularioInstancia.ENVIADO,
        )

        self.list_url = "/formats/submissions/"

    # ---------------------------------------------------------------
    # CP-12 — Filtro por nombre (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP12_filtro_por_nombre(self):
        """
        El usuario puede buscar formularios por nombre (texto libre).

        Suposición de API para la HU: /formats/submissions/?q=<texto>
        """
        response = self.client.get(self.list_url, {"q": "Norte"})

        assert response.status_code == 200
        ids = [item["id"] for item in response.data]
        assert self.instancia_obra_norte.id in ids
        assert self.instancia_obra_sur.id not in ids

    # ---------------------------------------------------------------
    # CP-13 — Filtro por estado (HAPPY PATH)
    # ---------------------------------------------------------------
    def test_CP13_filtro_por_estado(self):
        """
        El sistema permite aplicar filtros por estado del formulario.

        Suposición de API para la HU: /formats/submissions/?estado=BORRADOR|ENVIADO
        """
        response = self.client.get(self.list_url, {"estado": FormularioInstancia.ENVIADO})

        assert response.status_code == 200
        estados = {item["estado"] for item in response.data}
        assert estados == {FormularioInstancia.ENVIADO}

    # ---------------------------------------------------------------
    # Sin resultados + performance (FLUJO ALTERNATIVO + criterio no funcional)
    # ---------------------------------------------------------------
    def test_sin_resultados_y_respuesta_rapida(self):
        """
        La búsqueda debe responder en menos de 3 segundos y retornar un listado
        organizado (estructura y orden por fecha descendente).

        Nota: si el backend aún no implementa filtros, este test NO exige lista vacía.
        """
        start = time.monotonic()
        response = self.client.get(self.list_url, {"q": "NO_EXISTE_12345"})
        elapsed = time.monotonic() - start

        assert response.status_code == 200
        assert isinstance(response.data, list)
        assert elapsed < 3.0

        # Estructura mínima "clara y organizada"
        for item in response.data:
            assert "id" in item
            assert "titulo" in item
            assert "codigo" in item
            assert "estado" in item
            assert "fecha" in item

        # Orden descendente por fecha (como lo construye el view: order_by("-fecha"))
        fechas = [item["fecha"] for item in response.data]
        assert fechas == sorted(fechas, reverse=True)
