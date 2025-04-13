from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)

# ✅ Allow all origins during development
CORS(app)

DATA_FILE = 'data/user_stats.json'

def load_stats():
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    stats = load_stats()
    return jsonify(stats)

@app.route('/api/stats', methods=['POST'])
def save_stats():
    stats = request.get_json()
    with open(DATA_FILE, 'w') as f:
        json.dump(stats, f, indent=2)
    return {"message": "Stats saved successfully"}, 200

if __name__ == '__main__':
    app.run(debug=True)
