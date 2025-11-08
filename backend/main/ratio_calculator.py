import numpy as np
from scipy.spatial import distance as dist
from scipy.constants import golden as phi

def calculate_ratios(landmarks):
    """
    Calculates various facial ratios based on the 68 facial landmarks
    and compares them to the golden ratio (phi).

    Args:
        landmarks (numpy.ndarray): A 68x2 array of (x, y) coordinates.

    Returns:
        list: A list of dictionaries, where each dictionary contains the
              name of the measurement, the calculated ratio, and how
              close that ratio is to phi (as a percentage).
    """
    # A dictionary to hold our calculated measurements
    measurements = {}

    # --- Vertical Measurements ---
    # Full face height (top of jawline to chin)
    measurements["face_height"] = dist.euclidean(landmarks[8], landmarks[27]) # Chin to Top of Nose Bridge
    # Nose length (top of bridge to bottom)
    measurements["nose_length"] = dist.euclidean(landmarks[27], landmarks[33])
    # Chin to bottom lip
    measurements["chin_to_lip"] = dist.euclidean(landmarks[8], landmarks[57])
    # Nose tip to bottom lip
    measurements["nose_to_lip"] = dist.euclidean(landmarks[33], landmarks[57])


    # --- Horizontal Measurements ---
    # Full face width (across cheekbones)
    measurements["face_width"] = dist.euclidean(landmarks[0], landmarks[16])
    # Nose width (across nostrils)
    measurements["nose_width"] = dist.euclidean(landmarks[31], landmarks[35])
    # Lip width
    measurements["lip_width"] = dist.euclidean(landmarks[48], landmarks[54])
    # Inner eye distance
    measurements["inner_eye_dist"] = dist.euclidean(landmarks[39], landmarks[42])
    # Outer eye distance
    measurements["outer_eye_dist"] = dist.euclidean(landmarks[36], landmarks[45])


    # --- Calculate Ratios ---
    # We store the results in a list of dictionaries for easy display later
    results = []

    # Define the ratios we want to calculate
    # Each tuple contains: (Ratio Name, Numerator Measurement, Denominator Measurement)
    ratio_definitions = [
        ("Face Height / Face Width", "face_height", "face_width"),
        ("Nose Length / Chin to Lip", "nose_length", "chin_to_lip"),
        ("Lip Width / Nose Width", "lip_width", "nose_width"),
        ("Outer Eye Dist / Inner Eye Dist", "outer_eye_dist", "inner_eye_dist"),
        ("Face Height / Nose Length", "face_height", "nose_length"),
        ("Nose to Lip / Chin to Lip", "nose_to_lip", "chin_to_lip"),
    ]

    for name, num_key, den_key in ratio_definitions:
        # Get the measurement values
        numerator = measurements.get(num_key, 0)
        denominator = measurements.get(den_key, 0)

        # Avoid division by zero
        if denominator == 0:
            ratio = 0
            closeness = 0
        else:
            ratio = numerator / denominator
            # Calculate how close the ratio is to phi, expressed as a percentage
            # A score of 100 means a perfect match.
            closeness = 100 * (1 - abs(ratio - phi) / phi)

        results.append({
            "name": name,
            "ratio": round(ratio, 3),
            "closeness_to_phi": round(closeness, 2)
        })

    return results

if __name__ == '__main__':
    # This is a simple test to show how to use the function.
    # It creates a fake set of landmarks.
    print(f"The Golden Ratio (Phi) is approximately: {phi:.3f}\n")

    # Create a dummy 68x2 array with random-ish data for testing
    # In the real app, this will come from the face_detector.
    dummy_landmarks = np.random.randint(100, 400, (68, 2))

    # Re-create a few "perfect" ratios for demonstration
    # Face Height / Face Width
    dummy_landmarks[8] = [200, 362]  # Chin
    dummy_landmarks[27] = [200, 200] # Top of Nose
    dummy_landmarks[0] = [100, 250]  # Left Cheek
    dummy_landmarks[16] = [300, 250] # Right Cheek
    # This makes height = 162, width = 200. Ratio = 0.81 (not close)

    # Lip Width / Nose Width
    dummy_landmarks[48] = [170, 320] # Left Lip Corner
    dummy_landmarks[54] = [230, 320] # Right Lip Corner
    dummy_landmarks[31] = [181, 290] # Left Nostril
    dummy_landmarks[35] = [219, 290] # Right Nostril
    # This makes lip_width = 60, nose_width = 38. Ratio = 1.579 (very close to phi)

    test_results = calculate_ratios(dummy_landmarks)

    for result in test_results:
        print(f"{result['name']}:")
        print(f"  - Ratio: {result['ratio']:.3f}")
        print(f"  - Closeness to Phi: {result['closeness_to_phi']}%")
        print("-" * 20)