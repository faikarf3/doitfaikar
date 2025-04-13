async function loadStats() {
    const res = await fetch("http://127.0.0.1:5000/api/stats");
    const data = await res.json();
    document.getElementById("point").textContent = data.points;
    document.getElementById("level").textContent = "Level: " + data.level;
    document.getElementById("progress-bar").textContent = "XP " + data.xp;
}

async function addPoints() {
    const res = await fetch("http://127.0.0.1:5000/api/stats");
    const data = await res.json();

    data.points += 50;
    data.xp += 5

    if (data.xp >= 100) {
        data.level += 1
        data.xp = 0
    }

    await fetch("http://127.0.0.1:5000/api/stats", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    loadStats()
}

async function loadTask() {
    const res = await fetch("http://127.0.0.1:5000/api/tasks")
    const tasks = await res.json();

    const ongoingTask = document.getElementById('ongoing-task');
    const completedTask = document.getElementById('completed-task');

    ongoingTask.innerHTML = "";
    completedTask.innerHTML = "";

    for (const task of tasks) {
        const taskElement = document.createElement("div");
        taskElement.textContent = `${task.name}:\n${task.deadline}\n${task.priority}`

        if (task.completed) {
            completedTask.appendChild(taskElement);
        }
        else {
            ongoingTask.appendChild(taskElement);
        }
    }

}

async function createTask() {
    console.log("called");
    const name = document.getElementById('task-name').value;
    const date = document.getElementById('task-deadline').value;
    const priority = document.getElementById('task-priority').value;

    if (!name || !date || !priority) 
    {
        alert("Please fill everything");
        return;
    }

    const newTask = {
        id: Date.now(),
        name: name,
        deadline: date,
        priority: priority,
        completed: false
    };

    const res = await fetch("http://127.0.0.1:5000/api/tasks");
    const tasks = await res.json();

    tasks.push(newTask);

    await fetch("http://127.0.0.1:5000/api/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(tasks)
    });

    document.getElementById('task-name').value ="";
    document.getElementById('task-deadline').value = "";
    document.getElementById('task-priority').value ="low";
    
    loadTask();
    

}

window.addEventListener("DOMContentLoaded", () => {
    loadStats();
    loadTask();
  });
  