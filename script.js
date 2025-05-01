let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let completedTaskCount = 0;

document.addEventListener("DOMContentLoaded", function() {
    renderTasks();
    updateCompletedCount();
    // Initialize calendar only if calendar tab is active on load (optional)
    // if (document.getElementById('calendar').classList.contains('active')) {
    //     initializeCalendar();
    // }
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
        status: 'todo'  //  New tasks go to "В работе"
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

    if (tabName === 'calendar') {
        initializeCalendar(); // Initialize the calendar when the calendar tab is opened
    }
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

function initializeCalendar() {
    const calendarBody = document.getElementById('calendar-body');
    const currentMonthDisplay = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    function generateCalendar(month, year) {
        calendarBody.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDay = firstDayOfMonth.getDay();

        currentMonthDisplay.textContent = new Date(year, month).toLocaleDateString('default', { month: 'long', year: 'numeric' });

        let date = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');

            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                if (i === 0 && j < startingDay) {
                    // Empty cells before the first day of the month
                } else if (date <= daysInMonth) {
                    cell.textContent = date;
                    date++;
                }
                row.appendChild(cell);
            }

            calendarBody.appendChild(row);

            if (date > daysInMonth) {
                break; // Stop creating rows when all days are filled
            }
        }
    }

    function changeMonth(direction) {
        if (direction === 'prev') {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
        } else {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }
        generateCalendar(currentMonth, currentYear);
    }

    prevMonthButton.addEventListener('click', () => changeMonth('prev'));
    nextMonthButton.addEventListener('click', () => changeMonth('next'));

    generateCalendar(currentMonth, currentYear); // Initial calendar generation
}
function createTaskElement(task) {
    const taskId = task.id;
    const taskElement = document.createElement("div");
    taskElement.id = taskId;
    taskElement.className = "task";
    taskElement.draggable = true;

    //  Add click listener to open task details
    taskElement.addEventListener("click", () => openTaskDetailsModal(task));

    taskElement.innerHTML = `
        ${task.name}<br>
        <small>${task.description}</small>
        <span class="delete-btn" onclick="deleteTask('${taskId}')"></span>`;
    taskElement.addEventListener("dragstart", drag);
    return taskElement;
}


function openTaskDetailsModal(task) {
    document.getElementById("taskDetailsName").textContent = task.name;
    document.getElementById("taskDetailsPhone").textContent = task.phone || 'Не указан'; // Handle missing data
    document.getElementById("taskDetailsAddress").textContent = task.address || 'Не указан'; // Handle missing data
    document.getElementById("taskDetailsDescription").textContent = task.description;
    document.getElementById("taskDetailsModal").style.display = "block";
}

function closeTaskDetailsModal() {
    document.getElementById("taskDetailsModal").style.display = "none";
}

window.onclick = function(event) {
    const newTaskModal = document.getElementById("newTaskModal");
    if (event.target == newTaskModal) {
        closeNewTaskModal();
    }

    const taskDetailsModal = document.getElementById("taskDetailsModal");
    if (event.target == taskDetailsModal) {
        closeTaskDetailsModal();
    }
}
