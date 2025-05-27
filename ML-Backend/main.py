import torch
import numpy as np
import cv2
from collections import Counter
from ultralytics import YOLO
from fastapi import FastAPI, UploadFile, File
import shutil
import requests
import os
from datetime import datetime

app = FastAPI()
import random
# Load YOLO models
accident_model = YOLO("yolov8_trained_model.pt")  # Path to your accident detection model
severity_model = YOLO("severity_trained_model.pt")  # Path to your severity classification model

# Target backend server to send the result
TARGET_SERVER_URL = "http://localhost:5000/accidents"

accident_locations = [
    {"location": "Chennai - Mount Road", "lat": 13.067439, "lng": 80.237617},
    {"location": "Salem - Five Roads", "lat": 11.664325, "lng": 78.146014},
    {"location": "Erode - Perundurai Road", "lat": 11.342423, "lng": 77.728165},
    {"location": "Madurai - Bypass Road", "lat": 9.925201, "lng": 78.119774},
    {"location": "Coimbatore - Gandhipuram", "lat": 11.016844, "lng": 76.955832},
    {"location": "Tiruchirappalli - Central Bus Stand", "lat": 10.790483, "lng": 78.704674},
    {"location": "Tirunelveli - Palayamkottai", "lat": 8.713912, "lng": 77.756652},
    {"location": "Vellore - Katpadi", "lat": 12.971599, "lng": 79.150041},
    {"location": "Dindigul - NH 44", "lat": 10.366667, "lng": 77.966667},
    {"location": "Thanjavur - New Bus Stand", "lat": 10.785034, "lng": 79.137826}
]

accident_locations1 = [
    {"location": "GH Roundabout", "lat": 11.338480, "lng": 77.730370},
    {"location": "Perundurai Road", "lat": 11.342423, "lng": 77.728165},
    {"location": "Surampatti Four Road", "lat": 11.327276, "lng": 77.714852},
    {"location": "Chithode Bypass", "lat": 11.386238, "lng": 77.695127},
    {"location": "Sathy Road", "lat": 11.357221, "lng": 77.717026},
    {"location": "Brough Road", "lat": 11.339690, "lng": 77.727630},
    {"location": "Manickampalayam Junction", "lat": 11.340919, "lng": 77.716728},
    {"location": "Texvalley Junction", "lat": 11.312049, "lng": 77.729647},
    {"location": "Thindal Murugan Temple Road", "lat": 11.317164, "lng": 77.676392},
    {"location": "Bus Stand Road (Central BS)", "lat": 11.344179, "lng": 77.729512}
]

accident_locations2 = [
    {"location": "Guindy Industrial Estate", "lat": 13.0105, "lng": 80.2124},
    {"location": "Kathipara Junction", "lat": 13.0170, "lng": 80.2037},
    {"location": "Poonamallee High Road ", "lat": 13.0526, "lng": 80.1709},
    {"location": "Koyambedu Junction", "lat": 13.0700, "lng": 80.1980},
    {"location": "Anna Arch, Aminjikarai", "lat": 13.0691, "lng": 80.2206},
    {"location": "Napier Bridge", "lat": 13.0806, "lng": 80.2909},
    {"location": "Inner Ring Road Padi Bridge", "lat": 13.0981, "lng": 80.1983},
    {"location": "Butt Road Junction, Guindy", "lat": 13.0325, "lng": 80.2017},
    {"location": "Pallikaranai Bridge", "lat": 12.9480, "lng": 80.2182},
    {"location": "Sardar Patel Road ", "lat": 13.0067, "lng": 80.2444}
]


# Confidence threshold for accident detection
ACCIDENT_CONF_THRESHOLD = 0.5  # or 0.5 based on preference
MIN_ACCIDENT_FRAMES = 20  # Minimum frames needed to consider as an accident

def process_video(video_path, top_n=20):
    results = accident_model(video_path)  # Detect accidents in video

    accident_frames = []
    confidence_scores = []
    
    frame_accident_count = 0  # Counter for accident frames

    for frame_idx, result in enumerate(results):
        if len(result.boxes) > 0:
            for box in result.boxes:
                class_id = int(box.cls[0])
                conf = float(box.conf[0])

                if class_id == 0 and conf >= ACCIDENT_CONF_THRESHOLD:  # '0' is "accident"
                    accident_frames.append((frame_idx, result.orig_img))
                    confidence_scores.append(conf)
                    frame_accident_count += 1

    # Ensure accident occurs for a minimum number of frames
    if frame_accident_count < MIN_ACCIDENT_FRAMES:
        print("No valid accident detected (not enough confident frames).")
        return "No Accident Detected"

    # Sort frames by confidence score (high to low)
    sorted_indices = np.argsort(confidence_scores)[::-1]

    # Pick top-N confident frames
    top_frames = [accident_frames[i][1] for i in sorted_indices[:top_n]]

    # Run severity classification on selected frames
    severity_predictions = []
    severity_confidences = []

    for frame in top_frames:
        severity_result = severity_model(frame)
        if len(severity_result[0].boxes) > 0:
            for box in severity_result[0].boxes:
                severity_class = int(box.cls[0])  # Get severity class
                severity_conf = float(box.conf[0])  # Get confidence

                severity_predictions.append(severity_class)
                severity_confidences.append(severity_conf)

    # Majority voting based on confidence-weighted severity scores
    severity_counts = Counter(severity_predictions)
    final_severity = severity_counts.most_common(1)[0][0] if severity_predictions else None

    # Get severity label
    severity_label = severity_model.names[final_severity] if final_severity is not None else "Unknown"

    print(f"Final Predicted Severity: {severity_label}")
    return severity_label


@app.post("/predict/")
async def predict_video(file: UploadFile = File(...)):
    video_path = f"temp_{file.filename}"

    # Save uploaded video to disk
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process video and get severity label
    predicted_severity = process_video(video_path, top_n=20)

    selected_location = random.choice(accident_locations2)

    # Generate Google Maps link
    google_maps_link = f"https://www.google.com/maps?q={selected_location['lat']},{selected_location['lng']}"
    selected_location["maps_link"] = google_maps_link
    selected_location["datetime"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Human-readable date & time
    selected_location["severity_label"]=str(predicted_severity)
    # Send result to another backend
    response=""
    print(selected_location)
    if predicted_severity == "Unknown":
        selected_location["severity_label"] = "Accident"
        response = requests.post(TARGET_SERVER_URL, json=selected_location)
    elif predicted_severity != "No Accident Detected":
        response = requests.post(TARGET_SERVER_URL, json=selected_location)
    print(response)
    # Remove temporary video file
    os.remove(video_path)

    return {"predicted_severity": predicted_severity}
