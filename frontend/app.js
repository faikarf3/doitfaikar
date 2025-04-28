//REGISTRATION AND LOGIN
async function register() {
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;

    const res = await fetch('http://127.0.0.1:5000/api/register', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password})
    });
    const data = await res.json()
    console.log(data);
    if (res.ok) {
        alert("✅ Registered! Now log in.");
        window.location.href = "login.html";
      } else {
        alert(data.error)      }

}


async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const res = await fetch('http://127.0.0.1:5000/api/login', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password})
    });

    const data = await res.json()
    if (res.ok) {
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("username", data.username);
        window.location.href = "index.html";
        console.log("logged in");

      } else {
        alert(data.error);
      }
}


//PAGE LOADING
async function loadStats() {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("You're not logged in.");
        window.location.href = "login.html";
        return;
    }

    const res = await fetch(`http://127.0.0.1:5000/api/${userId}/stats`);
    const data = await res.json();

    if (!res.ok) {
        alert(data.error || "Failed to fetch stats");
        return;
    }

    document.getElementById("user-name").textContent = data.username;
    document.getElementById("user-points").textContent = "Points: " + data.points;
    document.getElementById("user-level").textContent = "Level: " + data.level;
    document.getElementById("user-xp").textContent = "XP: " + data.xp;
}

async function loadTasks() {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("You're not logged in.");
        window.location.href = "login.html";
        return;
    }
    const res = await fetch(`http://127.0.0.1:5000/api/${userId}/stats`);
    const data = await res.json();

    if (!res.ok) {
        alert(data.error || "Failed to fetch stats");
        return;
    }
    const ongoingTask = document.getElementById('ongoing-task');
    const completedTask = document.getElementById('completed-task');
    const lateTask = document.getElementById('late-task');
    const today = new Date();

    
    for (const task of data.tasks) {
        const deadline = new Date(task.deadline);
        if (!task.completed && !task.penalized && today > deadline) {
            task.penalized = true;
            markTaskLate(task.id)
            console.log(`Task ${task.name} is late`);
        }
        const taskElement = document.createElement('div');
        taskElement.className = "task";
        taskElement.textContent = task.name;
        if (task.completed) {
            completedTask.appendChild(taskElement);
        } 
        else if (task.penalized) {
            lateTask.appendChild(taskElement);
        } else {
            ongoingTask.appendChild(taskElement);
        }
    }

}

async function markTaskLate(taskId) {
    const userId = localStorage.getItem('user_id');

    const res = await fetch(`http://127.0.0.1:5000/api/${userId}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            penalized: true
        })
    });

    const data = await res.json();
    if (!res.ok){
        error(data.error);
    }
}


//UPDATING DATA
async function createTask() {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("You're not logged in.");
        window.location.href = "login.html";
        return;
    }
    const task_name = document.getElementById("task-name").value;
    const task_deadline = document.getElementById("task-deadline").value;
    const task_priority = document.getElementById("task-priority").value;

    const res = await fetch(`http://127.0.0.1:5000/api/${userId}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "name": task_name,
            "deadline": task_deadline,
            "priority": task_priority
        })
    });


    if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to create task");
        return;
    }
    
    const data = await res.json();
    console.log("Task created successfully:", data);
    alert("Task created successfully!");
    
}

async function addPoints() {
    const userId = localStorage.getItem("user_id");
    const res = await fetch(`http://127.0.0.1:5000/api/${userId}/stats`);
    const data = await res.json();

    if (!res.ok) {
        alert(data.error || "Failed to fetch stats");
        return;
    }
    data.points += 100;
    data.xp += 10;

    if (data.xp >= 100) {
        data.level += 1;
        data.xp = 0;
    }
    const updateRes = await fetch(`http://127.0.0.1:5000/api/${userId}/stats`, {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "points": data.points,
            "xp": data.xp,
            "level": data.level
        })
    });

    const updateData = await updateRes.json();

    if (!updateRes.ok) {
        alert(updateData.error || "Failed to update stats");
        return;
    }
}


//PAGE HANDLING

window.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
        loadStats();
        loadTasks();
    } else {
        window.location.href = "login.html";
    }
});