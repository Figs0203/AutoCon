from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import FormatoTecnico
from .serializers import FormatoTecnicoSerializer

@api_view(["GET"])
def lista_formatos(request):
    formatos = FormatoTecnico.objects.filter(activo=True)
    serializer = FormatoTecnicoSerializer(formatos, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def detalle_formato(request, pk):
    try:
        formato = FormatoTecnico.objects.get(pk=pk, activo=True)
        serializer = FormatoTecnicoSerializer(formato)
        return Response(serializer.data)
    except FormatoTecnico.DoesNotExist:
        return Response(
            {"error": "Formato no encontrado"}, 
            status=status.HTTP_404_NOT_FOUND
        )