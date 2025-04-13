from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from backend.cal_schedulelogic import generate_schedule
import os

# Initialize Flask app and enable CORS
app = Flask(__name__, static_folder="../frontend")
CORS(app)

# Route to serve the frontend's index.html
@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

# Route to serve other static files (e.g., CSS, JS)
@app.route("/<path:path>")
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

# API route to handle scheduling logic
@app.route("/schedule", methods=["POST"])
def schedule():
    data = request.json
    activities = data.get("activities", [])

    # Call the custom scheduling logic
    scheduled_activities = generate_schedule(activities)

    return jsonify({"schedule": scheduled_activities})

# Main entry point for the app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Default to port 5000 if PORT is not set
    app.run(host="0.0.0.0", port=port, debug=True)