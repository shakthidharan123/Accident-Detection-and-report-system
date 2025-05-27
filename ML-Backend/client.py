import requests

# URL of the FastAPI server
API_URL = "http://localhost:8000/predict/"

# Path to the video file
VIDEO_PATH = "test_video1.mp4"

# Open the video file and send it as a request
with open(VIDEO_PATH, "rb") as file:
    response = requests.post(API_URL, files={"file": file})

# Print the response from the server
print(response.json())
