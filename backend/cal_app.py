from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.cal_schedulelogic import generate_schedule
import os


app = Flask(__name__)
CORS(app)

@app.route("/schedule", methods=["POST"])
def schedule():
    data = request.json
    activities = data.get("activities", [])

    scheduled_activities = generate_schedule(activities)

    return jsonify({"schedule": scheduled_activities})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Default to port 5000 if PORT is not set
    app.run(host="0.0.0.0", port=port, debug=True)
