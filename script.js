let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let completedTaskCount = 0;

document.addEventListener("DOMContentLoaded", function() {
    renderTasks();
    updateCompletedCount(); // Initialize completed count on load
});

function renderTasks() {
    const columns = ['todo', 'in-progress', 'done'];

    columns.forEach(columnId => {
        const column = document.getElementById(columnId);
        column.querySelector('.task-container').innerHTML = '';

        tasks.forEach(task => {
            if (task.status === columnId) {
                const taskElement = createTaskElement(task);
                column.querySelector('.task-container').appendChild(taskElement);
            }
        });
    });

    updateCompletedCount();
}

function createTaskElement(task) {
    const taskId = task.id;
    const taskElement = document.createElement("div");
    taskElement.id = taskId;
    taskElement.className = "task";
    taskElement.draggable = true;
    taskElement.innerHTML = `
        ${task.name}<br>
        <small>${task.description}</small>
        <span class="delete-btn" onclick="deleteTask('${taskId}')"></span>`;
    taskElement.addEventListener("dragstart", drag);
    return taskElement;
}


function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    updateLocalStorage();
    renderTasks();
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

function drop(event, columnId) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    const draggedElement = document.getElementById(data);
    if (draggedElement) {
        const taskStatus = columnId;
        updateTaskStatus(data, taskStatus);
        event.target.querySelector('.task-container').appendChild(draggedElement);
    }
}


function updateTaskStatus(taskId, newStatus) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                status: newStatus
            };
        }
        return task;
    });
    updateLocalStorage();
    renderTasks();
}

function updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function openNewTaskModal() {
    document.getElementById("newTaskModal").style.display = "block";
}

function closeNewTaskModal() {
    document.getElementById("newTaskModal").style.display = "none";
}

function saveNewTask() {
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const description = document.getElementById("description").value;

    if (!name || !description) {
        alert("Name and description are required!");
        return;
    }

    const newTask = {
        id: "task-" + Date.now(),
        name: name,
        phone: phone,
        address: address,
        description: description,
        status: 'in-progress'
    };

    tasks.push(newTask);
    updateLocalStorage();
    renderTasks();
    closeNewTaskModal();

    document.getElementById("newTaskForm").reset();
}

function searchTasks() {
    const searchTerm = document.getElementById("search-input").value.toLowerCase();
    const allTasks = document.querySelectorAll('.task');

    allTasks.forEach(task => {
        const taskText = task.textContent.toLowerCase();
        if (taskText.includes(searchTerm)) {
            task.style.display = "";
        } else {
            task.style.display = "none";
        }
    });
}

function openTab(tabName) {
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    const tabbuttons = document.getElementsByClassName("tab-button");
    for (let i = 0; i < tabbuttons.length; i++) {
        tabbuttons[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    event.currentTarget.classList.add("active");
}

function updateCompletedCount() {
    completedTaskCount = tasks.filter(task => task.status === 'done').length;
    document.getElementById("completed-count").textContent = `Completed: ${completedTaskCount}`;
}

window.onclick = function(event) {
    const modal = document.getElementById("newTaskModal");
    if (event.target == modal) {
        closeNewTaskModal();
    }
}
