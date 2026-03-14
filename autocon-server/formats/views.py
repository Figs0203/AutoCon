from django.shortcuts import render
from django.contrib.auth.models import User

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import FormatoTecnico, FormularioInstancia
from .serializers import FormatoTecnicoSerializer, FormularioInstanciaSerializer

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
        
@api_view(["POST"])
def guardar_formulario(request):
    serializer = FormularioInstanciaSerializer(data=request.data)
    
    if serializer.is_valid():
        #Asigna el primer usuario que encuentre (solo para pruebas, en producción se debe usar autenticación real)
        usuario_temp = User.objects.first()
        serializer.save(usuario=usuario_temp)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    