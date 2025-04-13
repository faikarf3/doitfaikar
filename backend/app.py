from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)


CORS(app)

DATA_FILE = 'data/user_stats.json'

def load_stats():
    with open(DATA_FILE, 'r') as f:
        return json.load(f)
def save_stats(stats):
    with open(DATA_FILE, 'w') as f:
        json.dump(stats, f, indent=2)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    stats = load_stats()
    return jsonify(stats)

@app.route('/api/stats', methods=['POST'])
def post_stats():
    stats = request.get_json()
    save_stats(stats)
    return {"message": "Stats saved successfully"}, 200


TASK_FILE = 'data/tasks.json' 

def load_task():
    with open(TASK_FILE, 'r') as f:
        return json.load(f)
def save_task(task):
    with open(TASK_FILE, 'w') as f:
        json.dump(task, f, indent=2)


@app.route('/api/tasks', methods=['GET'])
def get_task():
    task = load_task()
    return jsonify(task)

@app.route('/api/tasks', methods=["POST"])
def update_task():
    task = request.get_json()
    save_task(task)
    return {"message": "Task updated successfully"}, 200

if __name__ == '__main__':
    app.run(debug=True)
