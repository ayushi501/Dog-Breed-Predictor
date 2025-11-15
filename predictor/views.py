from django.shortcuts import render
from .utils import predict_breed
import os
from django.http import JsonResponse
import google.generativeai as genai
from django.conf import settings



# Create your views here.
def index(request):
    context = {}
    if request.method == "POST" and request.FILES.get('dog_image'):
        dog_image = request.FILES['dog_image']
        upload_dir = 'media/uploads'
        os.makedirs(upload_dir, exist_ok = True)

        save_path = os.path.join(upload_dir, dog_image.name)
        with open(save_path, 'wb+') as destination:
            for chunk in dog_image.chunks():
                destination.write(chunk)

        breed, confidence = predict_breed(save_path)

        # AJAX Response
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({
                'breed': breed,
                'confidence': confidence
            })

        # Non-AJAX Response
        context = {
            'breed': breed,
            'confidence': confidence,
            'image_path': '/' + save_path
        }

    return render(request, 'index.html', context)



def know_more(request, breed):
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)

        prompt = f"Describe the {breed} dog breed in 100 words."
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)

        data = {
            "description": response.text.strip()
        }
        return JsonResponse(data)
    except Exception as e:
        print("Gemini API error:", e)
        return JsonResponse({"description": "Description not available."}, status=500)

