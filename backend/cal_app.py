from flask import Flask, request, jsonify
from flask_cors import CORS
from cal_schedulelogic import generate_schedule

app = Flask(__name__)
CORS(app)

@app.route("/schedule", methods=["POST"])
def schedule():
    data = request.json
    activities = data.get("activities", [])

    scheduled_activities = generate_schedule(activities)

    return jsonify({"schedule": scheduled_activities})

if __name__ == "__main__":
    app.run(debug=True)
