import PubSub from 'pubsub-js';
import detailsIcon from './info-icon.svg';
import removeIcon from './trash-icon.svg';
import listMarker from './chevron-icon.svg';

const taskList = document.querySelector('.task-list');
const messageDialog = document.querySelector('.message-dialog');

export function setUpUserInterface() {
    const NEW_TASK = 'new task created', NEW_LIST = 'new list created', SHOW_ALL_TASKS = 'show all tasks';

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
        console.log('clicked');
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
        });
    });

    //click listener for button which loads all existing tasks across all lists
    document.querySelector('.all-tasks').addEventListener('click', () => {
        PubSub.publish(SHOW_ALL_TASKS);
    });
};

export function updateTaskList(list) {
    taskList.innerHTML = '';

    // for (let i = 0; i < list.tasks.length; i++) {
    //     taskList.append(generateTaskItemElement(list.tasks[i]));
    // }

    list.tasks.forEach((value, key)=>{
        taskList.append(generateTaskItemElement(value));
    })
}

function generateTaskItemElement(task) {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = task.title;

    const taskInfo = document.createElement('div');
    taskInfo.classList.add('task-info');

    const taskTitle = document.createElement('p');
    taskTitle.classList.add('task-title');
    taskTitle.textContent = task.title;

    const taskDueDate = document.createElement('p');
    taskDueDate.classList.add('task-due-date');
    taskDueDate.textContent = task.dueDate;

    taskInfo.append(taskTitle, taskDueDate);

    const detailsButton = document.createElement('button');
    detailsButton.classList.add('details-button');
    detailsButton.style.backgroundImage = `url(${detailsIcon})`;
    detailsButton.addEventListener('click', () => {

    });

    const deleteTaskButton = document.createElement('button');
    deleteTaskButton.classList.add('delete-task-button');
    deleteTaskButton.style.backgroundImage = `url(${removeIcon})`;

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

        lists[i].tasks.forEach((value, key)=>{
            taskList.append(generateTaskItemElement(value));
        })
    }
}

export function updateActiveListHeader(title) {
    const activeListHeader = document.querySelector('.active-list-header');
    activeListHeader.textContent = title;
}