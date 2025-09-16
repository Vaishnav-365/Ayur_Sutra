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
