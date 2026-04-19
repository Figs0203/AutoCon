from rest_framework import serializers

from .models import FormatoTecnico, FormularioInstancia, ImagenFormulario


class FormatoTecnicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormatoTecnico
        fields = "__all__"


class FormularioInstanciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormularioInstancia
        fields = "__all__"
        read_only_fields = ["usuario"]


class ImagenFormularioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenFormulario
        fields = ["id", "imagen", "nombre_original", "tamano", "subida_en"]
        read_only_fields = ["id", "tamano", "subida_en"]
