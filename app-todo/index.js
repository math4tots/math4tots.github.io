// index.js
document.addEventListener('DOMContentLoaded', function () {
  const taskForm = document.getElementById('task-form');
  const addTaskButton = document.getElementById('add-task-button');
  const taskModal = document.getElementById('task-modal');
  const closeBtn = document.querySelector('.close');
  const titleInput = document.getElementById('title');
  const dueDateInput = document.getElementById('due-date');
  const tagsInput = document.getElementById('tags');
  const descriptionInput = document.getElementById('description');
  const tasksList = document.getElementById('tasks');

  // Function to show the modal
  function showModal() {
    taskModal.style.display = 'block';
  }

  // Function to hide the modal
  function hideModal() {
    taskModal.style.display = 'none';
    taskForm.reset(); // Reset the form when hiding the modal
  }

  // Show the modal when the "Add Task" button is clicked
  addTaskButton.addEventListener('click', showModal);

  // Hide the modal when the close button is clicked
  closeBtn.addEventListener('click', hideModal);

  // Function to add a new task
  function addTask(event) {
    event.preventDefault();

    const titleText = titleInput.value.trim();
    const dueDate = dueDateInput.value;
    const tagsText = tagsInput.value.trim();
    const descriptionText = descriptionInput.value.trim();

    if (titleText === '') {
      alert('Please enter a title for the task!');
      return;
    }

    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <span class="task-drag-handle">&#9776;</span>
        <p>${titleText}</p>
        <p class="small-text">Due Date: ${dueDate}</p>
        <p class="small-text">Tags: ${tagsText}</p>
        <button class="edit-task-button">Edit</button>
        <button class="delete-task">Delete</button>
    `;

    tasksList.appendChild(listItem);

    hideModal(); // Hide the modal after adding the task

    // Add a click event listener to the delete button
    const deleteButton = listItem.querySelector('.delete-task');
    deleteButton.addEventListener('click', function () {
      listItem.remove();
      updateLocalStorage();
    });

    updateLocalStorage();

    // Make the task item draggable
    makeTaskDraggable(listItem);
  }

  // Function to make a task item draggable
  function makeTaskDraggable(taskItem) {
    taskItem.draggable = true;
    taskItem.addEventListener('dragstart', function (event) {
      event.dataTransfer.setData('text/plain', taskItem.innerHTML);
      taskItem.style.opacity = '0.6';
    });

    taskItem.addEventListener('dragend', function () {
      taskItem.style.opacity = '1';
    });
  }

  // Function to update localStorage with the current tasks
  function updateLocalStorage() {
    const tasks = [];
    tasksList.querySelectorAll('li').forEach(function (taskElement) {
      const taskData = {
        title: taskElement.querySelector('p:nth-child(2)').textContent,
        dueDate: taskElement.querySelector('p:nth-child(3)').textContent,
        tags: taskElement.querySelector('p:nth-child(4)').textContent,
        description: taskElement.querySelector('p:nth-child(5)').textContent,
      };
      tasks.push(taskData);
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Function to remove a task from localStorage
  function removeTaskFromLocalStorage(titleText) {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = savedTasks.filter((task) => task.title !== titleText);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  }

  // Load tasks from localStorage on page load
  function loadTasksFromLocalStorage() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

    savedTasks.forEach(function (taskData) {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
              <span class="task-drag-handle">&#9776;</span>
              <p>${taskData.title}</p>
              <p class="small-text">${taskData.dueDate}</p>
              <p class="small-text">${taskData.tags}</p>
              <button class="edit-task-button">Edit</button>
              <button class="delete-task">Delete</button>
          `;

      tasksList.appendChild(listItem);

      // Add a click event listener to the delete button
      const deleteButton = listItem.querySelector('.delete-task');
      deleteButton.addEventListener('click', function () {
        listItem.remove();
        removeTaskFromLocalStorage(taskData.title);
      });

      // Make the task item draggable
      makeTaskDraggable(listItem);
    });
  }

  // Add task when the form is submitted
  taskForm.addEventListener('submit', addTask);

  // Load tasks from localStorage on page load
  loadTasksFromLocalStorage();

  // Allow dropping items to rearrange
  tasksList.addEventListener('dragover', function (event) {
    event.preventDefault();
  });

  tasksList.addEventListener('drop', function (event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    const droppedTask = document.createElement('li');
    droppedTask.innerHTML = data;
    makeTaskDraggable(droppedTask);

    if (event.target.tagName === 'LI') {
      event.target.insertAdjacentElement('beforebegin', droppedTask);
    } else {
      event.target.appendChild(droppedTask);
    }

    // Remove the old task item from the source row
    const sourceRow = document.querySelector('.dragging');
    sourceRow.remove();

    updateLocalStorage();
  });

  // Highlight the dragging task
  tasksList.addEventListener('dragstart', function (event) {
    if (event.target.tagName === 'LI') {
      event.target.classList.add('dragging');
    }
  });

  // Remove the highlight when the drag ends
  tasksList.addEventListener('dragend', function (event) {
    const draggingTask = document.querySelector('.dragging');
    if (draggingTask) {
      draggingTask.classList.remove('dragging');
    }
  });
  // ... Previous JavaScript code ...

  // Function to open the edit task modal
  function openEditTaskModal(taskElement) {
    const editTaskModal = document.getElementById('edit-task-modal');
    const editTitleInput = document.getElementById('edit-title');
    const editDueDateInput = document.getElementById('edit-due-date');
    const editTagsInput = document.getElementById('edit-tags');
    const editDescriptionInput = document.getElementById('edit-description');

    const taskData = {
      title: taskElement.querySelector('p:nth-child(2)').textContent,
      dueDate: taskElement.querySelector('p:nth-child(3)').textContent,
      tags: taskElement.querySelector('p:nth-child(4)').textContent,
      description: taskElement.querySelector('p:nth-child(5)').textContent,
    };

    editTitleInput.value = taskData.title;
    editDueDateInput.value = taskData.dueDate;
    editTagsInput.value = taskData.tags;
    editDescriptionInput.value = taskData.description;

    editTaskModal.style.display = 'block';

    // Handle form submission for editing the task
    const editTaskForm = document.getElementById('edit-task-form');
    editTaskForm.addEventListener('submit', function (event) {
      event.preventDefault();

      // Update the task item with edited data
      taskElement.querySelector('p:nth-child(2)').textContent = editTitleInput.value;
      taskElement.querySelector('p:nth-child(3)').textContent = editDueDateInput.value;
      taskElement.querySelector('p:nth-child(4)').textContent = editTagsInput.value;
      taskElement.querySelector('p:nth-child(5)').textContent = editDescriptionInput.value;

      updateLocalStorage();
      editTaskModal.style.display = 'none';
    });
  }

  // Add a click event listener to each "Edit" button
  tasksList.querySelectorAll('.edit-task-button').forEach(function (editButton) {
    editButton.addEventListener('click', function () {
      const taskElement = editButton.parentElement;
      openEditTaskModal(taskElement);
    });
  });

  // ... Rest of the JavaScript code ...

});
