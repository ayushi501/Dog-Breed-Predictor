import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'dog_breed_predictor.keras')
model = load_model(MODEL_PATH)

BREEDS = ['scottish_deerhound', 'entlebucher', 'bernese_mountain_dog']

def predict_breed(img_path):
    img = image.load_img(img_path, target_size = (224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = x/255.0

    preds = model.predict(x)
    predicted_breed = BREEDS[np.argmax(preds)]
    confidence = np.max(preds)

    return predicted_breed, round(float(confidence), 2)