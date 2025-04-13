async function loadStats() {
    const res = await fetch("http://127.0.0.1:5000/api/stats");
    const data = await res.json();
    document.getElementById("point").textContent = data.points;
    document.getElementById("level").textContent = "Level: " + data.level;
    document.getElementById("progress-bar").textContent = "XP " + data.xp;
}

window.addEventListener("DOMContentLoaded", () => {
    loadStats();
  });
  