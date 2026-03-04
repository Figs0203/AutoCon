from rest_framework.routers import DefaultRouter
from .views import FormViewSet
#from .views import QuestionViewSet

router = DefaultRouter()
router.register(r'forms', FormViewSet) #r-string para evitar problemas con caracteres especiales en las urls
#router.register(r'questions', QuestionViewSet)

urlpatterns = router.urls