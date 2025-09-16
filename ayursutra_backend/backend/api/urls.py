from django.urls import path
from .views import AgenticAIView

urlpatterns = [
    path("agentic-ai/", AgenticAIView.as_view(), name="agentic-ai"),
]
