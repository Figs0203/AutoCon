from django.shortcuts import render

from rest_framework import viewsets

from .models import Form
from .serializer import FormSerializer

#from .models import Question
#from .serializer import QuestionSerializer

class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    
# class QuestionViewSet(viewsets.ModelViewSet):
#     queryset = Question.objects.all()
#     serializer_class = QuestionSerializer
    
    