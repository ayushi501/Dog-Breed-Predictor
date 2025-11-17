import tensorflow as tf
import os

# Path to your original Keras model
MODEL_H5_PATH = os.path.join(os.path.dirname(__file__), 'dog_breed_predictor.keras')

# Path to save TFLite model
MODEL_TFLITE_PATH = os.path.join(os.path.dirname(__file__), 'model.tflite')

# Load original Keras model
model = tf.keras.models.load_model(MODEL_H5_PATH)

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save TFLite model
with open(MODEL_TFLITE_PATH, 'wb') as f:
    f.write(tflite_model)

print(f"TFLite model saved to {MODEL_TFLITE_PATH}")
