from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils.timezone import now
from datetime import timedelta
from .models import Doctor
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate, get_user_model
import random
import re
User = get_user_model()

class UserRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        username = data.get("username")
        email = data.get("email", "")
        phone = data.get("phone", "")
        password = data.get("password")
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        role = data.get("role", "patient")  # default to patient

        if not username or not password:
            return Response({"error": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            role=role,
            password=make_password(password),  # 🔐 hash before saving
        )

        return Response(
            {"message": "User registered successfully", "id": user.id, "username": user.username},
            status=status.HTTP_201_CREATED,
        )



class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        username = data.get("username")
        password = data.get("password")

        user = authenticate(username=username, password=password)
        if user is not None:
            return Response(
                {
                    "message": "Login successful",
                    "user": {"id": user.id, "username": user.username, "email": user.email, "phone": user.phone}
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class AgenticAIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get("name")
        problem = request.data.get("problem")
        priority = request.data.get("priority", "Medium")  # get priority from frontend

        if not name or not problem:
            return Response({"error": "Name and problem are required."}, status=status.HTTP_400_BAD_REQUEST)

        doctors = Doctor.objects.all()
        if not doctors.exists():
            return Response({"error": "No doctors available."}, status=status.HTTP_404_NOT_FOUND)

        # Clean and split problem into keywords
        problem_words = set(re.findall(r'\w+', problem.lower()))

        matching_doctors = []

        # Step 1: Match by speciality using substring matching
        for doctor in doctors:
            speciality_lower = doctor.speciality.lower()
            if any(word in speciality_lower for word in problem_words):
                matching_doctors.append(doctor)

        # Step 2: If no speciality match, match by therapy using substring
        if not matching_doctors:
            for doctor in doctors:
                therapy_lower = doctor.therapy.lower()
                if any(word in therapy_lower for word in problem_words):
                    matching_doctors.append(doctor)

        # Step 3: If multiple matches, pick the doctor with highest keyword overlap
        if matching_doctors:
            def overlap_count(doc):
                return sum(word in doc.speciality.lower() for word in problem_words)
            matching_doctors.sort(key=overlap_count, reverse=True)
            selected_doctor = matching_doctors[0]
        else:
            # Fallback → pick random doctor
            selected_doctor = random.choice(doctors)

        # Suggest schedule (2 days later)
        suggested_date = (now() + timedelta(days=2)).strftime("%Y-%m-%d %I:%M %p")

        # Structured response
        response = {
            "therapy": selected_doctor.therapy,
            "doctor_name": selected_doctor.name,
            "speciality": selected_doctor.speciality,
            "available_days": selected_doctor.available_days,
            "available_time": selected_doctor.available_time,
            "schedule": suggested_date,
            "priority": priority  # include user-selected priority
        }

        return Response(response, status=status.HTTP_200_OK)
