from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data/database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


CORS(app)

DATA_FILE = 'data/user_stats.json'


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    # relationship to tasks
    tasks = db.relationship('Task', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(128))
    deadline = db.Column(db.String(10))
    priority = db.Column(db.String(10))
    completed = db.Column(db.Boolean, default=False)
    penalized = db.Column(db.Boolean, default=False)

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
