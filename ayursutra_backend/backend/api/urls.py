from django.urls import path
from .views import AgenticAIView, UserRegisterView, UserLoginView

urlpatterns = [
    path("agentic-ai/", AgenticAIView.as_view(), name="agentic-ai"),
    path("user/register/", UserRegisterView.as_view(), name="user-register"),
    path("user/login/", UserLoginView.as_view(), name="user-login"),
]