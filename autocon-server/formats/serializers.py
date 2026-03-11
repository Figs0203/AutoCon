from rest_framework import serializers
from .models import FormatoTecnico, Diligenciamiento

class FormatoTecnicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormatoTecnico
        fields = "__all__"

class DiligenciamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diligenciamiento
        fields = "__all__"