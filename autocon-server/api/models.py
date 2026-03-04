from django.db import models

class Form (models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    list_of_questions = models.JSONField(default=list, blank=True)

    status = models.CharField(max_length=20, default='active') #TODO <- Cambien el estado default segun sea necesario, quizas 'draft' o 'inactive' o algo asi
    
# class Question (models.Model):
#     id = models.AutoField(primary_key=True)
#     question_text = models.CharField(max_length=200)


