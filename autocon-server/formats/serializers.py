from rest_framework import serializers
from .models import FormatoTecnico, FormularioInstancia

class FormatoTecnicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormatoTecnico
        fields = "__all__"

class FormularioInstanciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormularioInstancia
        fields = "__all__"
        read_only_fields = ['usuario']