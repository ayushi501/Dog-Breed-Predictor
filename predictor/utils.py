import numpy as np
from PIL import Image
import os
import tflite_runtime.interpreter as tflite

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'model.tflite')

# Initialize TFLite interpreter
interpreter = tflite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# List of dog breeds (keep same as your model)
BREEDS = ['scottish_deerhound', 'entlebucher', 'bernese_mountain_dog']

def predict_breed(img_path):
    # Load and preprocess image
    img = Image.open(img_path).resize((224, 224))  # same target size as training
    x = np.array(img, dtype=np.float32)
    x = x / 255.0  # normalize
    x = np.expand_dims(x, axis=0)  # add batch dimension

    # Set input tensor
    interpreter.set_tensor(input_details[0]['index'], x)
    interpreter.invoke()

    # Get prediction
    output_data = interpreter.get_tensor(output_details[0]['index'])
    predicted_index = np.argmax(output_data)
    confidence = float(np.max(output_data))

    predicted_breed = BREEDS[predicted_index]
    return predicted_breed, round(confidence, 2)
