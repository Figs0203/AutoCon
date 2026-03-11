from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response, Serializer
from rest_framework.decorators import api_view

@api_view(['GET'])
def test_users(request):
    return Response({"message": "Backend conectado correctamente 🚀"})

