from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'data', 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


CORS(app)

db = SQLAlchemy(app)



class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    # relationship to tasks
    tasks = db.relationship('Task', backref='user', lazy=True)

    xp = db.Column(db.Integer, default = 0)
    points = db.Column(db.Integer, default = 0)
    level  = db.Column(db.Integer, default = 1)

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

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Please fill username and password"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409
    new_user = User(username=username)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user_id": new_user.id}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        return jsonify({
            "message": "Login successful",
            "user_id": user.id,
            "username": user.username,
            "points": user.points,
            "xp": user.xp,
            "level": user.level
        }
        ), 200
    return jsonify({"error": "Invalid username or password"}), 401

@app.route('/api/<int:user_id>/stats', methods=["GET"])
def get_stats(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    tasks = Task.query.filter_by(user_id=user_id).all()

    task_list = []
    for task in tasks:
        task_list.append({
            "id": task.id,
            "user_id": task.user.id,
            "name": task.name,
            "deadline": task.deadline,
            "priority": task.priority,
            "completed": task.completed,
            "penalized": task.penalized
        })
    return jsonify({
        "message": "Request successful",
        "username": user.username,
        "points": user.points,
        "level": user.level,
        "xp": user.xp,
        "tasks": task_list
        }), 200

@app.route('/api/<int:user_id>/stats', methods=["POST"])
def post_stats(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    user.points = data.get("points", user.points)
    user.xp = data.get("xp", user.xp)
    user.level = data.get("level", user.level)

    db.session.commit()
    
    return jsonify({"message": "Stats updated successfully"}), 200

@app.route('/api/<int:user_id>/tasks', methods = ['POST'])
def post_tasks(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    name = data.get('name')
    deadline = data.get('deadline')
    priority = data.get('priority')

    new_task = Task(
        user_id=user_id,
        name=name,
        deadline=deadline,
        priority=priority,
        completed=False,
        penalized=False
    )

    db.session.add(new_task)
    db.session.commit()

    return jsonify({"message": "Task successfully created", "task_id": new_task.id}), 201

@app.route('/api/<int:user_id>/tasks/<int:task_id>', methods = ["PUT"])
def update_task(user_id, task_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    data = request.get_json()
    task.name = data.get('name', task.name)
    task.deadline = data.get('deadline', task.deadline)
    task.priority = data.get('priority', task.priority)
    task.completed = data.get('completed', task.completed)
    task.penalized = data.get('penalized', task.penalized)

    db.session.commit()

    return jsonify({"message": "successfully updated task"}), 200
        
        



if __name__ == '__main__':
    app.run(debug=True)
