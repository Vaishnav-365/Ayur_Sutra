from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailOrPhoneBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = User.objects.get(email=username)  # check email
        except User.DoesNotExist:
            try:
                user = User.objects.get(phone=username)  # check phone
            except User.DoesNotExist:
                return None

        if user.check_password(password):
            return user
        return None
