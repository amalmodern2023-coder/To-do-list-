# To-do-list-
Project 
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Advanced To-Do List App</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
body{
  background: linear-gradient(135deg,#667eea,#764ba2);
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  transition: background 0.3s ease, color 0.3s ease;
  padding-top:60px;
}
.card{
  max-width:600px;
  width:100%;
  border-radius:16px;
  transition: background 0.3s ease, color 0.3s ease, transform 0.2s ease;
}
.card:hover{transform: scale(1.02);}
.task{transition: all 0.3s ease; position: relative;}
.task.completed span{text-decoration:line-through;color:#fff;}
.list-group-item{
  transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  cursor:pointer;
}
.list-group-item:hover{transform: translateX(5px);}

/* Tiny Animations */
@keyframes pulse {0%{transform:scale(1);}50%{transform:scale(1.05);}100%{transform:scale(1);}}
@keyframes fadeOut {0%{opacity:1;}100%{opacity:0; transform:translateX(-20px);}}
.pulse{animation: pulse 0.3s ease;}
.fadeOut{animation: fadeOut 0.3s ease forwards;}

#emptyState{display:none;}
body.dark{background:#121212;color:#f1f1f1;}
body.dark .card{background:#1f1f1f;color:#f1f1f1;}
body.dark .btn{border-color:#fff;color:#fff;}

/* Dark/Light Mode Button */
.mode-btn{
  width:40px;height:40px;border-radius:50%;border:none;
  cursor:pointer;font-size:18px;display:flex;justify-content:center;align-items:center;
  transition: all 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
  background:#333;color:#fff;position:fixed;top:20px;right:20px;z-index:1000;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}
.mode-btn:hover{transform: scale(1.2) rotate(15deg);box-shadow: 0 6px 10px rgba(0,0,0,0.5);}
body.dark .mode-btn{background:#fff;color:#333;}

/* Tiny Bounce عند Hover على Pie Chart */
#chart:hover{transform: scale(1.05);transition: transform 0.3s ease;}

/* Hover Effect على كل Task */
.list-group-item.task:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Task Colors */
.completed{background-color:#ff69b4;color:#fff;} /* Pink */
.pending{background-color:#9370db;color:#fff;}   /* Purple */
.inprogress{background-color:#87cefa;color:#fff;}/* Blue */

/* Tooltip بسيط */
.task:hover::after {
  content: attr(data-status);
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.2s ease;
}
</style>
</head>
<body>

<div class="card shadow p-4">
  <h4 class="text-center mb-3">📝 To-Do List</h4>

  <!-- Static Panels -->
  <div class="row text-center mb-3">
    <div class="col"><div class="p-2 bg-light rounded">Total<br><b id="total">0</b></div></div>
    <div class="col"><div class="p-2 bg-light rounded">Completed<br><b id="completed">0</b></div></div>
    <div class="col"><div class="p-2 bg-light rounded">Pending<br><b id="pending">0</b></div></div>
  </div>

  <!-- Add Task -->
  <div class="input-group mb-2">
    <input id="taskInput" class="form-control" placeholder="Add new task">
    <select id="taskStatus" class="form-select" style="max-width:150px;">
      <option value="pending">Pending</option>
      <option value="inprogress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
    <button class="btn btn-primary" onclick="addTask()">Add</button>
  </div>

  <!-- Search -->
  <input class="form-control mb-3" placeholder="Search tasks..." onkeyup="searchTask(this.value)">

  <!-- Filters -->
  <div class="text-center mb-3">
    <button class="btn btn-sm btn-dark" onclick="filter('all')">All</button>
    <button class="btn btn-sm btn-success" onclick="filter('completed')">Completed</button>
    <button class="btn btn-sm btn-info" onclick="filter('pending')">Pending</button>
    <button class="btn btn-sm btn-warning" onclick="filter('inprogress')">In Progress</button>
  </div>

  <!-- Tasks -->
  <ul class="list-group mb-3" id="list"></ul>

  <!-- Empty State -->
  <div id="emptyState" class="text-center text-muted">
    ✨ No tasks yet<br><small>Add your first task</small>
  </div>

  <!-- Pie Chart -->
  <canvas id="chart"></canvas>
</div>

<!-- Dark/Light Mode Circular Button -->
<button id="modeBtn" class="mode-btn" onclick="toggleMode()">🌙</button>

<script>
const list = document.getElementById("list");
const input = document.getElementById("taskInput");
const statusSelect = document.getElementById("taskStatus");

// Chart
let chart = new Chart(document.getElementById("chart"),{
  type:"pie",
  data:{
    labels:["Completed","Pending","In Progress"],
    datasets:[{
      data:[0,0,0],
      backgroundColor:["#ff69b4","#9370db","#87cefa"],
      hoverOffset:8,
      borderWidth:1
    }]
  },
  options:{responsive:true,animation:{duration:500}}
});

// أصوات Subtle
const addSound = new Audio("https://freesound.org/data/previews/331/331912_3248244-lq.mp3");       // خفيف pop
const completeSound = new Audio("https://freesound.org/data/previews/156/156332_2731936-lq.mp3"); // خفيف click
const deleteSound = new Audio("https://freesound.org/data/previews/331/331912_3248244-lq.mp3");   // خفيف chime

// Dark/Light Mode Toggle
function toggleMode(){
  document.body.classList.toggle("dark");
  const btn = document.getElementById("modeBtn");
  btn.textContent = document.body.classList.contains("dark")?"☀️":"🌙";
}

// CRUD Functions
function addTask(){
  const taskText = input.value.trim();
  if(!taskText) return;
  const status = statusSelect.value;

  const li = document.createElement("li");
  li.className = `list-group-item d-flex justify-content-between task ${status}`;
  li.setAttribute("data-status", `Status: ${status.charAt(0).toUpperCase()+status.slice(1)}`);
  li.innerHTML = `<span onclick="toggle(this)">${taskText}</span>
                  <button class="btn btn-sm btn-danger" onclick="remove(this)">✕</button>`;
  list.appendChild(li);

  // Animation + صوت Add
  li.classList.add("pulse");
  setTimeout(()=> li.classList.remove("pulse"), 300);
  addSound.play();

  input.value="";
  save();
}

function toggle(span){
  const li = span.parentElement;
  li.classList.toggle("completed");
  if(li.classList.contains("completed")){
    li.classList.remove("inprogress","pending");
    li.classList.add("completed");
    li.classList.add("pulse");
    setTimeout(()=> li.classList.remove("pulse"), 300);
    completeSound.play();
  }
  // تحديث Tooltip بعد تغيير الحالة
  const statusClass = li.classList.contains("completed") ? "Completed" :
                      li.classList.contains("inprogress") ? "In Progress" : "Pending";
  li.setAttribute("data-status", `Status: ${statusClass}`);
  save();
}

function remove(btn){
  const li = btn.parentElement;
  li.classList.add("fadeOut");
  setTimeout(()=> li.remove(),300);
  deleteSound.play();
  save();
}

function save(){
  localStorage.setItem("tasks", list.innerHTML);
  updateUI();
}

function load(){
  list.innerHTML = localStorage.getItem("tasks") || "";
  updateUI();
}

function updateUI(){
  const tasks = list.children.length;
  const completed = document.querySelectorAll(".task.completed").length;
  const pending = document.querySelectorAll(".task.pending").length;
  const inprogress = document.querySelectorAll(".task.inprogress").length;

  document.getElementById("total").textContent = tasks;
  document.getElementById("completed").textContent = completed;
  document.getElementById("pending").textContent = pending;

  chart.data.datasets[0].data=[completed,pending,inprogress];
  chart.update();

  document.getElementById("emptyState").style.display = tasks? "none":"block";
}

// Search & Filter
function searchTask(value){
  value=value.toLowerCase();
  [...list.children].forEach(li=>{
    li.style.display = li.innerText.toLowerCase().includes(value)?"flex":"none";
  });
}

function filter(type){
  [...list.children].forEach(li=>{
    if(type==="all") li.style.display="flex";
    else if(type==="completed") li.style.display=li.classList.contains("completed")?"flex":"none";
    else if(type==="pending") li.style.display=li.classList.contains("pending")?"flex":"none";
    else if(type==="inprogress") li.style.display=li.classList.contains("inprogress")?"flex":"none";
  });
}

load();
</script>

</body>
</html>
