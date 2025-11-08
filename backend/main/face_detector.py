import cv2
import dlib
import numpy as np
import os

# --- Constants ---
# Define the path to the shape predictor model file
# We use os.path.join to make it work on any operating system (Windows, Mac, Linux)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "shape_predictor_68_face_landmarks.dat")

# --- Error Classes ---
class NoFaceFoundError(Exception):
    """Custom exception raised when no face is detected in the image."""
    pass

class MultipleFacesFoundError(Exception):
    """Custom exception raised when multiple faces are detected."""
    pass

# --- Initialization ---
# Initialize dlib's face detector (HOG-based)
detector = dlib.get_frontal_face_detector()

# Load the facial landmark predictor
try:
    predictor = dlib.shape_predictor(MODEL_PATH)
except RuntimeError as e:
    print(f"Error loading model from {MODEL_PATH}")
    print("Please make sure you have downloaded the file and placed it in the 'models' directory.")
    print(f"Error details: {e}")
    exit()

def get_landmarks(image):
    """
    Detects faces in an image and returns the 68 facial landmarks
    for the first face found.

    Args:
        image (numpy.ndarray): The input image (loaded via OpenCV).

    Returns:
        numpy.ndarray: A 68x2 NumPy array where each row is an (x, y)
                       coordinate of a facial landmark.

    Raises:
        NoFaceFoundError: If no faces are detected in the image.
        MultipleFacesFoundError: If more than one face is detected.
    """
    # Convert the image to grayscale (dlib works on grayscale images)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Detect faces in the grayscale image.
    # The '1' indicates to upsample the image 1 time, which helps find smaller faces.
    rects = detector(gray, 1)

    # --- Handle detection results ---
    if len(rects) == 0:
        # If no faces are found, raise our custom error
        raise NoFaceFoundError("No face was detected in the provided image.")

    if len(rects) > 1:
        # If multiple faces are found, we raise an error.
        # For a Phi ratio, we should only analyze one face at a time.
        raise MultipleFacesFoundError("Multiple faces were detected. Please provide an image with one face.")

    # --- Get Landmarks ---
    # Get the landmarks for the *first* face found
    shape = predictor(gray, rects[0])

    # Convert the shape object to a 68x2 NumPy array
    # This makes it much easier to work with the coordinates
    coords = np.zeros((68, 2), dtype="int")
    for i in range(0, 68):
        coords[i] = (shape.part(i).x, shape.part(i).y)

    return coords