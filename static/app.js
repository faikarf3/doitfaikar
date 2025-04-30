const BASE_URL = window.location.origin;


//REGISTRATION AND LOGIN
async function register() {
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;

    const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password})
    });
    const data = await res.json()
    if (res.ok) {      
        window.location.href = "/login";
      } else {
        alert(data.error)      }

}


async function loginUser() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const res = await fetch(`${BASE_URL}/api/login`, {
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
        window.location.href = "/dashboard";
        console.log("logged in");

      } else {
        alert(data.error);
      }
}

function logout() {
    localStorage.removeItem("user_id"); // or localStorage.clear();
    window.location.href = "/";
}

//PAGE LOADING
async function loadStats() {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("You're not logged in.");
        window.location.href = "/login";
        return;
    }

    const res = await fetch(`${BASE_URL}/api/${userId}/stats`);
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
        window.location.href = "/login";
        return;
    }
    const res = await fetch(`${BASE_URL}/api/${userId}/stats`);
    const data = await res.json();

    if (!res.ok) {
        alert(data.error || "Failed to fetch stats");
        return;
    }
    const ongoingTask = document.getElementById('ongoing-task');
    const completedTask = document.getElementById('completed-task');
    const lateTask = document.getElementById('late-task');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    
    for (const task of data.tasks) {
        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);
        if (!task.completed && !task.penalized && today > deadline) {
            task.penalized = true;
            updatePoints(-100, 0);
            markTaskLate(task.id)
            console.log(`Task ${task.name} is late`);
        }
        const taskElement = document.createElement('div');
        taskElement.className = "task";
        const taskName = document.createElement('h4');
        taskName.textContent = task.name;
        const taskDesc = document.createElement("p");
        taskDesc.textContent = task.desc;
        const taskDeadline = document.createElement('p')
        taskDeadline.textContent = task.deadline;
        const deleteButton = document.createElement('button');
        deleteButton.onclick = () => deleteTask(task.id);
        deleteButton.textContent = "Delete Task";
        const completeButton = document.createElement('button');
        completeButton.id = "complete-button";
        completeButton.textContent = "Complete Task"
        completeButton.onclick = () => completeTask(task.id);
    

        taskElement.appendChild(taskName);
        taskElement.appendChild(taskDesc);
        taskElement.appendChild(taskDeadline);


        if (task.completed) {
            completedTask.appendChild(taskElement);
        } 
        else if (task.penalized) {
            taskElement.appendChild(completeButton);
            taskElement.appendChild(deleteButton);
            lateTask.appendChild(taskElement);
            

        } else {
            taskElement.appendChild(completeButton);
            ongoingTask.appendChild(taskElement);
            taskElement.appendChild(deleteButton);
        }
    }

}

async function completeTask(taskId) {
    const userId = localStorage.getItem('user_id');

    const res = await fetch(`${BASE_URL}/api/${userId}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            completed: true
        })
    });

    const data = await res.json();
    if (!res.ok){
        error(data.error);
    }
    updatePoints(50, 10);

    window.location.reload();
}

async function markTaskLate(taskId) {
    const userId = localStorage.getItem('user_id');

    const res = await fetch(`${BASE_URL}/api/${userId}/tasks/${taskId}`, {
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
        window.location.href = "/login.html";
        return;
    }
    const task_name = document.getElementById("task-name").value;
    const task_desc = document.getElementById("task-desc").value;
    const task_deadline = document.getElementById("task-deadline").value;
    const task_priority = document.getElementById("task-priority").value;

    const res = await fetch(`${BASE_URL}/api/${userId}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "name": task_name,
            "desc": task_desc,
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
    window.location.reload();
}

async function updatePoints(points, xp) {
    const userId = localStorage.getItem("user_id");
    const res = await fetch(`${BASE_URL}/api/${userId}/stats`);
    const data = await res.json();

    if (!res.ok) {
        alert(data.error || "Failed to fetch stats");
        return;
    }
    data.points += points;
    if (data.points < 0) {
        data.points = 0;
    }
    data.xp += xp;

    if (data.xp >= 100) {
        data.level += 1;
        data.xp = 0;
    }
    const updateRes = await fetch(`${BASE_URL}/api/${userId}/stats`, {
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
    window.location.reload();
}

async function deleteTask(taskId) {
    alert("Are you sure you want to delete this Task");
    const userId = localStorage.getItem('user_id');
    const res = await fetch(`${BASE_URL}/api/${userId}/tasks/${taskId}`, {
        method: "DELETE"
    });

    if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to delete task");
        return;
    }
    window.location.reload();
}

//PAGE HANDLING

window.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const userId = localStorage.getItem("user_id");

    if (path === "/dashboard") {
        // This is a protected page
        if (!userId) {
            console.log("No user_id found. Redirecting to login page...");
            window.location.href = "/login";
            return;
        }
        loadStats();
        loadTasks();
    }

    if (path === "/login") {
        // This is login page
        if (userId) {
            console.log("Already logged in. Redirecting to dashboard...");
            window.location.href = "/dashboard";
        }
    }
});


//PAGE HANDLING
function openTaskForm() {
    document.getElementById("create-task-button-container").style.display = "none";
    document.getElementById("task-form").style.display = "block";
}

function closeTaskForm() {
    document.getElementById("task-form").style.display = "none";
    document.getElementById("create-task-button-container").style.display = "block";
}

