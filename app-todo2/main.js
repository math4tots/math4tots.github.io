/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   tags: string,
 *   description: string,
 * }} Task
 */


/**
 * Ad-hoc function for generating UUID provided by ChatGPT
 * @returns {string}
 */
function generateUUID() {
  // Generate a Version 4 (random) UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Function to display the "New Task" modal
function openNewTaskModal() {
  const newTaskModal = document.getElementById("newTaskModal");
  newTaskModal.style.display = "block";

  // Clear the input fields when opening the modal
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDate").value = "";
  document.getElementById("taskTags").value = "";
  document.getElementById("taskDescription").value = "";

  // Add an event listener to the modal's close button
  const closeNewTaskModalButton = document.getElementById("closeNewTaskModal");
  closeNewTaskModalButton.addEventListener("click", () => {
    newTaskModal.style.display = "none";
  });

  // Add event listener to the "Save" button in the modal
  const saveNewTaskButton = document.getElementById("saveNewTask");
  saveNewTaskButton.addEventListener("click", () => {
    const title = document.getElementById("taskTitle").value;
    const date = document.getElementById("taskDate").value;
    const tags = document.getElementById("taskTags").value;
    const description = document.getElementById("taskDescription").value;

    // Create a task object with the input values
    const newTask = {
      id: generateUUID(),
      title,
      date,
      tags,
      description,
    };

    // Save the new task to localStorage
    // You need to implement this part in the main.js file
    saveNewTask(newTask);

    // Close the modal
    newTaskModal.style.display = "none";

    // Reload the tasks to update the task list
    loadTasks();
  });

  // Add an event listener to close the modal if the background is clicked
  window.addEventListener("click", (e) => {
    if (e.target === newTaskModal) {
      newTaskModal.style.display = "none";
    }
  });
}

// Function to delete a task from localStorage by index
function deleteTaskAtIndex(taskIndex) {
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  if (taskIndex < 0 || taskIndex >= storedTasks.length) {
    // Task index is out of bounds, handle error
    return;
  }

  // Remove the task at the specified index
  storedTasks.splice(taskIndex, 1);

  // Update localStorage with the modified task list
  localStorage.setItem("tasks", JSON.stringify(storedTasks));
}

// Function to display the "Edit Task" modal
function openEditTaskModalForIndex(taskIndex) {
  const editTaskModal = document.getElementById("editTaskModal");
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  if (taskIndex < 0 || taskIndex >= storedTasks.length) {
    // Task index is out of bounds, handle error
    return;
  }

  const task = storedTasks[taskIndex];

  // Populate the modal with the task's data
  document.getElementById("editTaskID").innerHTML = task.id;
  document.getElementById("editTaskTitle").value = task.title;
  document.getElementById("editTaskDate").value = task.date;
  document.getElementById("editTaskTags").value = task.tags;
  document.getElementById("editTaskDescription").value = task.description;

  // Show the "Edit Task" modal
  editTaskModal.style.display = "block";

  // Add an event listener to the modal's close button
  const closeEditTaskModalButton = document.getElementById("closeEditTaskModal");
  closeEditTaskModalButton.addEventListener("click", () => {
    editTaskModal.style.display = "none";
  });

  // Add event listener to the "Update" button in the modal
  const updateTaskButton = document.getElementById("updateTask");
  updateTaskButton.addEventListener("click", () => {
    // Get the updated task values from the modal
    const updatedTitle = document.getElementById("editTaskTitle").value;
    const updatedDate = document.getElementById("editTaskDate").value;
    const updatedTags = document.getElementById("editTaskTags").value;
    const updatedDescription = document.getElementById("editTaskDescription").value;

    // Update the task's properties
    task.title = updatedTitle;
    task.date = updatedDate;
    task.tags = updatedTags;
    task.description = updatedDescription;

    // Update the task in localStorage
    updateTaskAtIndex(taskIndex, task); // You need to implement this in your main.js

    // Close the modal
    editTaskModal.style.display = "none";

    // Reload the tasks to update the task list
    loadTasks();
  });

  // Add an event listener to the modal's delete button
  const deleteTaskButton = document.getElementById("deleteTask");
  deleteTaskButton.addEventListener("click", () => {
    // Delete the task from localStorage
    // You need to implement this in your main.js
    // After deleting, close the modal and reload the tasks
    // For example:
    deleteTaskAtIndex(taskIndex);
    editTaskModal.style.display = "none";
    loadTasks();
  });

  // Add an event listener to close the modal if the background is clicked
  window.addEventListener("click", (e) => {
    if (e.target === editTaskModal) {
      editTaskModal.style.display = "none";
    }
  });
}

// Function to save a new task to localStorage
function saveNewTask(newTask) {
  // Retrieve existing tasks from localStorage
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Add the new task to the array of tasks
  storedTasks.push(newTask);

  // Update localStorage with the modified task list
  localStorage.setItem("tasks", JSON.stringify(storedTasks));
}

// Function to update an existing task in localStorage
function updateTaskAtIndex(taskIndex, updatedTask) {
  // Retrieve existing tasks from localStorage
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  if (taskIndex < 0 || taskIndex >= storedTasks.length) {
    // Task index is out of bounds, handle error
    return;
  }

  // Update the task at the specified index with the new task data
  storedTasks[taskIndex] = updatedTask;

  // Update localStorage with the modified task list
  localStorage.setItem("tasks", JSON.stringify(storedTasks));
}

/**
 * Function to create a task item
 * @param {Task} task
 * @param {number} index
 * @returns {HTMLLIElement}
 */
function createTaskItem(task, index) {
  const taskItem = document.createElement("li");
  taskItem.classList.add("task-item");
  taskItem.innerHTML = `
      <div class="task-title">${task.title}</div>
      <div class="task-date">${task.date}</div>
      <div class="task-tags">${task.tags}</div>
      <div class="task-description">${task.description}</div>
      <button class="edit-task" data-task-index="${index}">Edit</button>
  `;

  // Attach an event listener for editing this task
  const editButton = taskItem.querySelector(".edit-task");
  editButton.addEventListener("click", (e) => {
    const taskIndex = e.target.getAttribute("data-task-index");
    openEditTaskModalForIndex(taskIndex);
  });

  return taskItem;
}

// Function to handle the search functionality
function searchTasks(searchTerm) {
  const tasksContainer = document.getElementById("tasks");
  tasksContainer.innerHTML = ""; // Clear the existing list

  /** @type {Task[]} */
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  storedTasks.forEach((task, index) => {
    if (task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      // Only display tasks whose title matches the search term
      const taskItem = createTaskItem(task, index);
      tasksContainer.appendChild(taskItem);
    }
  });
}

// Function to load tasks from localStorage and display them
function loadTasks() {
  const searchInput = document.getElementById("taskSearch");

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value;
    searchTasks(searchTerm);
  });

  // Initially load all tasks when the page loads
  searchTasks(""); // Pass an empty search term to display all tasks
}

document.addEventListener("DOMContentLoaded", () => {
  const newTaskButton = document.getElementById("newTaskButton");
  newTaskButton.addEventListener("click", openNewTaskModal);

  // Call loadTasks to display existing tasks on page load
  loadTasks();
});
