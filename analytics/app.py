from flask import Flask, jsonify
import json
from datetime import datetime

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "service": "SirsiNexus Analytics",
        "version": "1.0.0-demo",
        "status": "running",
        "features": ["user_analytics", "catalog_analytics", "performance_metrics"]
    })

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "analytics",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

@app.route("/api/analytics/dashboard")
def dashboard():
    return jsonify({
        "total_users": 247,
        "active_users": 89,
        "books_circulated": 1543,
        "popular_categories": [
            {"name": "Technology", "count": 45},
            {"name": "Science", "count": 32},
            {"name": "History", "count": 28}
        ],
        "performance": {
            "avg_response_time": "145ms",
            "uptime": "99.97%",
            "cpu_usage": "23%",
            "memory_usage": "67%"
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

if __name__ == "__main__":
    print("Starting SirsiNexus Analytics Service...")
    app.run(host="0.0.0.0", port=8000)
