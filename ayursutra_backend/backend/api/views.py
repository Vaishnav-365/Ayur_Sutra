from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils.timezone import now
from datetime import timedelta
from .models import Doctor
import random
import re

class AgenticAIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get("name")
        problem = request.data.get("problem")

        if not name or not problem:
            return Response({"error": "Name and problem are required."}, status=status.HTTP_400_BAD_REQUEST)

        doctors = Doctor.objects.all()
        if not doctors.exists():
            return Response({"error": "No doctors available."}, status=status.HTTP_404_NOT_FOUND)

        # Clean and split problem into keywords
        problem_words = re.findall(r'\w+', problem.lower())

        matching_doctors = []

        # Step 1: Match by speciality
        for doctor in doctors:
            speciality_words = re.findall(r'\w+', doctor.speciality.lower())
            if any(word in problem_words for word in speciality_words):
                matching_doctors.append(doctor)

        # Step 2: Match by therapy (if no speciality matched)
        if not matching_doctors:
            for doctor in doctors:
                therapy_words = re.findall(r'\w+', doctor.therapy.lower())
                if any(word in problem_words for word in therapy_words):
                    matching_doctors.append(doctor)

        # Step 3: Fallback → pick random doctor
        if not matching_doctors:
            selected_doctor = random.choice(doctors)
        else:
            # Pick the first matching doctor
            selected_doctor = matching_doctors[0]

        # Suggest schedule (2 days later)
        suggested_date = (now() + timedelta(days=2)).strftime("%Y-%m-%d %I:%M %p")

        response = {
            "therapy": selected_doctor.therapy,
            "doctor": f"{selected_doctor.name} ({selected_doctor.speciality})",
            "schedule": f"{suggested_date} | Available: {selected_doctor.available_days} {selected_doctor.available_time}",
        }

        return Response(response, status=status.HTTP_200_OK)
