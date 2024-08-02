import PubSub from 'pubsub-js';
import detailsIcon from './info-icon.svg';
import removeIcon from './trash-icon.svg';
import listMarker from './chevron-icon.svg';

const taskList = document.querySelector('.task-list');
const messageDialog = document.querySelector('.message-dialog');
const editTaskDialog = document.querySelector('.edit-task-dialog');

export function setUpUserInterface() {
    const NEW_TASK = 'new task created', NEW_LIST = 'new list created',
        SHOW_ALL_TASKS = 'show all tasks';

    const addTaskButton = document.querySelector('.add-task');
    const newTaskDialog = document.querySelector('.new-task-dialog');

    //Add task ('+') button click listener
    addTaskButton.addEventListener('click', () => {
        newTaskDialog.showModal();
    });

    //set up dialog form for adding new tasks
    const newTaskForm = document.querySelector('.new-task-dialog form');
    newTaskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = document.querySelector('#title-input').value;
        const dueDate = document.querySelector('#due-date-input').value;
        const priority = document.querySelector('#priority-input').value;
        const note = document.querySelector('#note-input').value;

        newTaskForm.reset();
        newTaskDialog.close();

        PubSub.publish(NEW_TASK, {
            title: title,
            dueDate: dueDate,
            priority: priority,
            note: note
        });
    });

    //set up dialog for adding new lists
    const newListDialog = document.querySelector('.new-list-dialog');

    document.querySelector('.add-list-button').addEventListener('click', () => {
        newListDialog.showModal();
    });

    const newListForm = document.querySelector('.new-list-dialog form');
    newListForm.addEventListener('submit', (event) => {
        event.preventDefault();
        newListDialog.close();

        PubSub.publish(NEW_LIST, document.querySelector('#list-title').value);
        newListForm.reset();
    });

    //click listener for dialog closing button
    const closeDialogButtons = document.querySelectorAll('.close-dialog-button');
    closeDialogButtons.forEach((element) => {
        element.addEventListener('click', () => {
            if (newListDialog.open) {
                newListDialog.close();
            }

            if (newTaskDialog.open)
                newTaskDialog.close();

            if (messageDialog.open)
                messageDialog.close();

            if (editTaskDialog.open)
                editTaskDialog.close();
        });
    });

    //click listener for button which loads all existing tasks across all lists
    document.querySelector('.all-tasks').addEventListener('click', () => {
        PubSub.publish(SHOW_ALL_TASKS);
    });
};

export function updateTaskList(list) {
    taskList.innerHTML = '';

    list.tasks.forEach((value, key) => {
        taskList.append(generateTaskItemElement(value));
    });
}

function generateTaskItemElement(task) {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = task.title;
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            requestTaskChanges({ id: task.id, isDone: true });
        } else if (!checkbox.checked) {
            requestTaskChanges({ id: task.id, isDone: false });
        }
    });

    const taskInfo = document.createElement('div');
    taskInfo.classList.add('task-info');

    const taskTitle = document.createElement('p');
    taskTitle.classList.add('task-title');
    taskTitle.textContent = task.title;

    const taskDueDate = document.createElement('p');
    taskDueDate.classList.add('task-due-date');
    taskDueDate.textContent = task.dueDate;

    taskInfo.append(taskTitle, taskDueDate);

    const EDIT_TASK = 'edit task button clicked';

    const detailsButton = document.createElement('button');
    detailsButton.classList.add('details-button');
    detailsButton.style.backgroundImage = `url(${detailsIcon})`;
    detailsButton.addEventListener('click', () => {
        PubSub.publish(EDIT_TASK, task.id);
    });

    const deleteTaskButton = document.createElement('button');
    deleteTaskButton.classList.add('delete-task-button');
    deleteTaskButton.style.backgroundImage = `url(${removeIcon})`;
    deleteTaskButton.addEventListener('click', () => {
        console.log('delete ' + task.title)
        requestTaskDeletion(task.id);
    });

    taskItem.append(checkbox, taskInfo, detailsButton, deleteTaskButton);

    return taskItem;
}

export function updateListsList(taskLists, activeListTitle) {
    const ACTIVE_LIST_CHANGE = 'active list changed';

    const listsList = document.querySelector('.lists-list');
    listsList.innerHTML = '';

    for (let i = 0; i < taskLists.length; i++) {
        const listItem = document.createElement('li');
        listItem.textContent = taskLists[i].title;

        if (taskLists[i].title === activeListTitle)
            listItem.style.fontWeight = 700;

        //click listener for lists list in menu
        listItem.addEventListener('click', () => {
            PubSub.publish(ACTIVE_LIST_CHANGE, taskLists[i]);
        });

        listsList.append(listItem);
    }
}

export function showMessage(message) {
    document.querySelector('.message-dialog p').textContent = message;

    messageDialog.showModal();
}

export function showAllTasks(lists) {
    taskList.innerHTML = '';
    updateActiveListHeader('All tasks');

    for (let i = 0; i < lists.length; i++) {

        lists[i].tasks.forEach((value, key) => {
            taskList.append(generateTaskItemElement(value));
        })
    }
}

export function updateActiveListHeader(title) {
    const activeListHeader = document.querySelector('.active-list-header');
    activeListHeader.textContent = title;
}

function requestTaskChanges(changeObject) {
    const TASK_MODIFICATION = 'task modified';

    PubSub.publish(TASK_MODIFICATION, changeObject);
}

export function showEditTaskDialog(id, setTitle, setDueDate, setPriority, setNote) {
    const editTaskForm = document.querySelector('.edit-task-dialog form');
    const titleInput = document.querySelector('#edit-title-input');
    const dueDateInput = document.querySelector('#edit-due-date-input');
    const priorityInput = document.querySelector('#edit-priority-input');
    const noteInput = document.querySelector('#edit-note-input');

    titleInput.value = `${setTitle}`;
    dueDateInput.value = setDueDate;
    priorityInput.value = setPriority.toLowerCase();
    noteInput.value = setNote;

    const submitEditFormHandler = (event) => {
        event.preventDefault();

        requestTaskChanges({ id: id, title: titleInput.value, nonFormattedDueDate: dueDateInput.value, priority: priorityInput.value, note: noteInput.value });

        editTaskDialog.close();
        editTaskForm.reset();

        editTaskForm.removeEventListener('submit', submitEditFormHandler);
    };

    editTaskDialog.showModal();

    editTaskForm.addEventListener('submit', submitEditFormHandler);
}

function requestTaskDeletion(id) {
    const confirmDeletionDialog = document.querySelector('.confirm-deletion-dialog');
    const deleteButton = document.querySelector('.delete-task');

    const deleteTask = () => {
        const DELETE_TASK = 'delete task';
        PubSub.publish(DELETE_TASK, id);

        confirmDeletionDialog.close();

        deleteButton.removeEventListener('click', deleteTask);
    };

    //confirming if user wants task to be deleted
    confirmDeletionDialog.showModal();
    deleteButton.addEventListener('click', deleteTask);

    document.querySelector('.close-deletion-dialog-button').addEventListener('click', () => {
        confirmDeletionDialog.close();
        deleteButton.removeEventListener('click', deleteTask);
    });
}