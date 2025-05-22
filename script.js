const API_URL = 'http://localhost:3000';
// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", async function () {
    await fetchTasks();
    initializePhoneMask();
});
// Получение задач с сервера
async function fetchTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) throw new Error('Ошибка загрузки задач');
        tasks = await response.json();
        renderTasks();
        updateCompletedCount();
    } catch (error) {
        console.error('Error:', error);
        showErrorAlert('Не удалось загрузить задачи');
    }
}
// Сохранение новой задачи
async function saveNewTask() {
    if (!validateForm('newTaskForm') || !validatePhone()) {
        return;
    }

    const phone = document.getElementById("phone").value;
    if (!isValidPhone(phone)) {
        showErrorAlert('Номер телефона должен быть в формате +7(XXX)XXX-XX-XX');
        return;
    }

    const newTask = {
        name: document.getElementById("name").value,
        phone: phone,
        address: document.getElementById("address").value,
        description: document.getElementById("description").value,
        departureDate: document.getElementById("departureDate").value,
        status: 'todo'
    };

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) throw new Error('Ошибка сохранения задачи');
        
        await fetchTasks();
        closeNewTaskModal();
        showSuccessAlert('Новая задача успешно создана!');
        document.getElementById("newTaskForm").reset();
    } catch (error) {
        console.error('Error:', error);
        showErrorAlert('Не удалось сохранить задачу');
    }
}

// Валидация телефона
function isValidPhone(phone) {
    const regex = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
    return regex.test(phone);
}

function validatePhone() {
    const phoneInput = document.getElementById("phone");
    const phone = phoneInput.value;
    const isValid = isValidPhone(phone);
    
    if (!isValid) {
        document.getElementById("phone-error").textContent = 'Введите телефон в формате +7(XXX)XXX-XX-XX';
        phoneInput.classList.add('invalid');
        return false;
    }
    
    document.getElementById("phone-error").textContent = '';
    phoneInput.classList.remove('invalid');
    return true;
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Ошибка обновления статуса');
        
        await fetchTasks();
    } catch (error) {
        console.error('Error:', error);
        showErrorAlert('Не удалось обновить статус задачи');
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Ошибка удаления задачи');
        
        await fetchTasks();
    } catch (error) {
        console.error('Error:', error);
        showErrorAlert('Не удалось удалить задачу');
    }
}


let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let completedTaskCount = 0;
let currentTaskDetailsId = null;
document.addEventListener("DOMContentLoaded", function () {
    renderTasks();
    updateCompletedCount();
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
        `;
    taskElement.addEventListener("dragstart", drag);
    taskElement.addEventListener("click", () => openTaskDetailsModal(task)); // Open details on click
    return taskElement;
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
    }
}

function updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
function openNewTaskModal() {
    document.getElementById("newTaskModal").style.display = "block";
}
function closeNewTaskModal() {
    document.getElementById("newTaskModal").style.display = "none";
    resetValidation('newTaskForm');
}
function resetValidation(formId) {
    const form = document.getElementById(formId);
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.textContent = '';
    });
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.classList.remove('invalid');
    });
}
function validateForm(formId) {
    const form = document.getElementById(formId);
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('invalid');
            const fieldId = field.id;
            const errorId = fieldId + '-error';
            const errorMessageElement = document.getElementById(errorId);
            if (errorMessageElement) {
                errorMessageElement.textContent = 'Это поле обязательно для заполнения.';
            }
        } else {
            field.classList.remove('invalid');
            const fieldId = field.id;
            const errorId = fieldId + '-error';
            const errorMessageElement = document.getElementById(errorId);
             if (errorMessageElement) {
                errorMessageElement.textContent = '';
            }
        }
    });

    return isValid;
}
function showSuccessAlert(message) {
    Swal.fire({
        icon: 'success',
        title: 'Успех!',
        text: message,
        timer: 1500,
        showConfirmButton: false
    });
}
function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Ошибка!',
        text: message,
    });
}
function saveNewTask() {
    if (!validateForm('newTaskForm')) {
        return;
    }
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const description = document.getElementById("description").value;
    const departureDate = document.getElementById("departureDate").value;
    const newTask = {
        id: "task-" + Date.now(),
        name: name,
        phone: phone,
        address: address,
        description: description,
        departureDate: departureDate,
        status: 'todo'
    };
    tasks.push(newTask);
    updateLocalStorage();
    renderTasks();
    closeNewTaskModal();
    showSuccessAlert('Новая задача успешно создана!');
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
        initializeCalendar();
    }
}
function updateCompletedCount() {
    completedTaskCount = tasks.filter(task => task.status === 'done').length;
    document.getElementById("completed-count").textContent = `Завершено: ${completedTaskCount}`;
}
window.onclick = function (event) {
    const newTaskModal = document.getElementById("newTaskModal");
    if (event.target == newTaskModal) {
        closeNewTaskModal();
    }
    const taskDetailsModal = document.getElementById("taskDetailsModal");
    if (event.target == taskDetailsModal) {
        closeTaskDetailsModal();
    }
    const taskListModal = document.getElementById("taskListModal");
    if (event.target == taskListModal) {
        closeTaskListModal();
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
                } else if (date <= daysInMonth) {
                    cell.textContent = date;
                    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                    const hasTasks = tasks.some(task => task.departureDate === fullDate);
                    if (hasTasks) {
                        cell.classList.add('has-event');
                        cell.addEventListener('click', () => openTaskListModal(fullDate));
                    }

                    date++;
                }
                row.appendChild(cell);
            }
            calendarBody.appendChild(row);
            if (date > daysInMonth) {
                break; 
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
    generateCalendar(currentMonth, currentYear);
}
function openTaskDetailsModal(task) {
    currentTaskDetailsId = task.id;
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editName').value = task.name;
    document.getElementById('editPhone').value = task.phone || '';
    document.getElementById('editAddress').value = task.address || '';
    document.getElementById('editDepartureDate').value = task.departureDate || '';
    document.getElementById('editDescription').value = task.description;
    document.getElementById("taskDetailsModal").style.display = "block";
}
function closeTaskDetailsModal() {
    document.getElementById("taskDetailsModal").style.display = "none";
    currentTaskDetailsId = null;
    resetValidation('editTaskForm');
}
function saveEditedTask() {
    const taskId = document.getElementById('editTaskId').value;
     if (!validateForm('editTaskForm')) {
        return;
    }
    const name = document.getElementById('editName').value;
    const phone = document.getElementById('editPhone').value;
    const address = document.getElementById('editAddress').value;
    const departureDate = document.getElementById('editDepartureDate').value;
    const description = document.getElementById('editDescription').value;
    Swal.fire({
        text: "Вы хотите сохранить изменения в этой задаче?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#76a05e',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Сохранить',
        cancelButtonText: 'Отмена'
    }).then((result) => {
        if (result.isConfirmed) {
            tasks = tasks.map(task => {
                if (task.id === taskId) {
                    return {
                        ...task,
                        name: name,
                        phone: phone,
                        address: address,
                        departureDate: departureDate,
                        description: description
                    };
                }
                return task;
            });
            updateLocalStorage();
            renderTasks();
            closeTaskDetailsModal();
            showSuccessAlert('Задача успешно обновлена!');
        }
    });
}
function deleteTaskFromDetails() {
    Swal.fire({
        text: "Вы действительно хотите удалить эту задачу?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#76a05e',
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена'
    }).then((result) => {
        if (result.isConfirmed) {
            if (currentTaskDetailsId) {
                deleteTask(currentTaskDetailsId);
                closeTaskDetailsModal();
                showSuccessAlert('Задача успешно удалена!');
            }
        }
    });
}

function openTaskListModal(date) {
    const taskList = tasks.filter(task => task.departureDate === date);
    const taskListContainer = document.getElementById('taskListContainer');
    const taskListDateDisplay = document.getElementById('taskListDate');

    taskListContainer.innerHTML = ''; 
    taskListDateDisplay.textContent = date;

    if (taskList.length === 0) {
        taskListContainer.textContent = 'Нет задач на этот день.';
    } else {
        taskList.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task-list-item');
            taskDiv.innerHTML = `
                <b>${task.name}</b><br>
                Телефон: ${task.phone || 'Не указан'}<br>
                Адрес: ${task.address || 'Не указан'}<br>
                Описание: ${task.description}
            `;
            taskListContainer.appendChild(taskDiv);
        });
    }

    document.getElementById('taskListModal').style.display = 'block';
}

function closeTaskListModal() {
    document.getElementById('taskListModal').style.display = 'none';
}
function initializePhoneMask() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(inputElement => {
        inputElement.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, ''); 
            let formattedValue = '';

            if (value.length > 0) {
                formattedValue = '+7('; 
                if (value.length > 1) {
                    formattedValue += value.substring(1, 4); 
                } else {
                    formattedValue += '';
                }
                if (value.length > 4) {
                    formattedValue += ')' + value.substring(4, 7); 
                } else if (value.length > 1) {
                    formattedValue += ')'; 
                }
                if (value.length > 7) {
                    formattedValue += '-' + value.substring(7, 9); 
                } else if (value.length > 4) {
                    formattedValue += ''; 
                }
                if (value.length > 9) {
                    formattedValue += '-' + value.substring(9, 11); 
                } else if (value.length > 7) {
                    formattedValue += ''; 
                }
            }

            e.target.value = formattedValue; 
        });
    });
}
