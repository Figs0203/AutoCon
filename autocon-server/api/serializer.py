from rest_framework import serializers 
from .models import Form

#from .models import Question

#Serializadores para convertir los modelos de la base a datos a formato JSON y al reves, para poder mandarlos por http

class FormSerializer(serializers.ModelSerializer):
    #list_of_questions = serializers.PrimaryKeyRelatedField(many=True, queryset=Question.objects.all())
    
    class Meta:
        model = Form
        fields = ['id', 'name', 'description', 'list_of_questions', 'status']
        

# class QuestionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Question
#         fields = ['id', 'question_text']
