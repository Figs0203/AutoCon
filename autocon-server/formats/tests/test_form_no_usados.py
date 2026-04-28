import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from users.models import UserProfile

from formats.models import FormatoTecnico, FormularioInstancia

pytestmark = pytest.mark.django_db


@pytest.mark.django_db
class TestEliminarFormulariosNoUsados:
    """
    HU-08 — Eliminar formularios no usados.
    """

    def setup_method(self):
        self.user = User.objects.create_user(username="test", password="1234")
        UserProfile.objects.create(user=self.user, role=UserProfile.SUPERVISOR_TECNICO)

        self.client = APIClient()
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        self.form_url = "/formats/submissions/"

        self.formato = FormatoTecnico.objects.create(
            nombre="Formato prueba",
            codigo="FOR-DEL-001",
            schema={"secciones": []},
            activo=True,
        )

    # ---------------------------------------------------------------
    # Happy Path — eliminación exitosa
    # ---------------------------------------------------------------
    def test_eliminar_formulario_exitoso(self):
        """
        El sistema elimina correctamente un formulario (instancia) existente.
        """
        instancia = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.user,
            datos={},
            estado=FormularioInstancia.BORRADOR,
        )

        response = self.client.delete(f"{self.form_url}{instancia.id}/")

        assert response.status_code == 204
        assert FormularioInstancia.objects.filter(pk=instancia.id).exists() is False

    # ---------------------------------------------------------------
    # Happy Path — listado actualizado tras eliminación
    # ---------------------------------------------------------------
    def test_listado_actualizado_despues_de_eliminar(self):
        """
        El formulario eliminado no debe aparecer en el listado.
        """
        instancia = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.user,
            datos={},
            estado=FormularioInstancia.BORRADOR,
        )

        response = self.client.delete(f"{self.form_url}{instancia.id}/")
        assert response.status_code == 204

        response = self.client.get(self.form_url)

        assert response.status_code == 200
        ids = [item["id"] for item in response.data]
        assert instancia.id not in ids

    # ---------------------------------------------------------------
    # Flujo alternativo — eliminar formulario inexistente
    # ---------------------------------------------------------------
    def test_eliminar_formulario_inexistente(self):
        """
        El sistema maneja correctamente la eliminación de un formulario inexistente (404).
        """
        invalid_id = 999999

        response = self.client.delete(f"{self.form_url}{invalid_id}/")

        assert response.status_code == 404
        assert "error" in response.data



    # Flujo alternativo — usuario sin permisos (rol SOCIOS)
    # ----------------------S-----------------------------------------
    def test_eliminar_formulario_usuario_no_autorizado(self):
        """
        El sistema debe impedir la eliminación de formularios cuando el usuario
        no tiene permisos suficientes.

        En AutoCon el rol sin permisos para modificar/eliminar instancias es SOCIOS.
        """
        user_no_autorizado = User.objects.create_user(username="user2", password="1234")
        UserProfile.objects.create(user=user_no_autorizado, role=UserProfile.SOCIOS)

        client = APIClient()
        token, _ = Token.objects.get_or_create(user=user_no_autorizado)
        client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        # Instancia creada por otro usuario (supervisor del setup)
        instancia = FormularioInstancia.objects.create(
            formato=self.formato,
            usuario=self.user,
            datos={},
            estado=FormularioInstancia.BORRADOR,
        )

        response = client.delete(f"{self.form_url}{instancia.id}/")

        assert response.status_code == 403
        assert FormularioInstancia.objects.filter(pk=instancia.id).exists() is True
