import './style.css';
import { setUpUserInterface, updateTaskList, updateListsList, showMessage, showAllTasks, updateActiveListHeader, showEditTaskDialog, populateListSelect } from './dommanager.js';
import PubSub from 'pubsub-js';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';

const NEW_TASK = 'new task created', NEW_LIST = 'new list created',
    ACTIVE_LIST_CHANGE = 'active list changed', SHOW_ALL_TASKS = 'show all tasks',
    TASK_MODIFICATION = 'task modified', EDIT_TASK = 'edit task button clicked',
    DELETE_TASK = 'delete task', POPULATE_LIST_SELECT_REQUEST = 'populate list select request';

class TaskList {
    tasks = new Map();

    static allLists = [];

    constructor(title) {
        this.title = title;
        TaskList.allLists.push(this);
        this.setAsActive();

        requestListsListUpdate();
    }

    static findByTitle(title) {
        return TaskList.allLists.find(list => list.title === title);
    }

    static getActiveList() {
        return this.activeList;
    }

    static resetActiveList() {
        this.activeList = -1;
    }

    static getTaskById(taskId) {
        for (const list of TaskList.allLists) {
            for (const item of list.tasks) {
                if (item[1].id === taskId) return item[1];
            }
        }

        return null;
    }

    static deleteTask(taskId) {
        for (const list of TaskList.allLists) {
            for (const item of list.tasks) {
                if (item[1].id === taskId) {
                    list.tasks.delete(taskId);
                }
            }
        }
    }

    addTask(task) {
        this.tasks.set(task.id, task);
    }

    setAsActive() {
        TaskList.activeList = this;
        requestUpdateActiveListHeader(this.title);

        requestUpdateTaskListInterface();
    }
}

class Task {
    constructor(title, listTitle, nonFormattedDueDate = '', priority = '', note = '') {
        this.title = title;
        this.nonFormattedDueDate = nonFormattedDueDate;

        nonFormattedDueDate == '' ? this.dueDate = '' : this.dueDate = getDate(nonFormattedDueDate);

        this.priority = priority;
        this.note = note;
        this.isDone = false;
        this.id = generateId();

        //add to task list
        TaskList.findByTitle(listTitle).addTask(this);
    }
}

//at page loading
setUpUserInterface();

function requestUpdateTaskListInterface() {
    console.log('active list:' + TaskList.getActiveList().title);
    if (TaskList.getActiveList() === -1) {
        requestShowAllTasks();
    } else {
        requestShowTasksFromList();
    }
}

//functions which call interface updates in dommanager.js
// function requestUpdateTaskListInterface() {
function requestShowTasksFromList() {
    updateTaskList(TaskList.getActiveList());
}

function requestListsListUpdate() {
    updateListsList(TaskList.allLists, TaskList.activeList.title);
}

function requestMessageDialog(message) {
    showMessage(message);
}

function requestShowAllTasks() {
    showAllTasks(TaskList.allLists);
}

function requestUpdateActiveListHeader(title) {
    updateActiveListHeader(title);
}

//subscribing to form submits in DOM
PubSub.subscribe(NEW_TASK, (msg, task) => {
    if (validateTitle(task.title)) {
        new Task(task.title, task.list, task.dueDate, task.priority, task.note);
        requestUpdateTaskListInterface();
    }
});

PubSub.subscribe(NEW_LIST, (msg, newListTitle) => {
    if (validateTitle(newListTitle) && TaskList.findByTitle(newListTitle) === undefined) {
        new TaskList(newListTitle);
        requestListsListUpdate();
    } else {
        requestMessageDialog('The name you entered is either not valid or is already in use.')
    }
});

PubSub.subscribe(ACTIVE_LIST_CHANGE, (msg, list) => {
    list.setAsActive();
    requestListsListUpdate();
});

PubSub.subscribe(SHOW_ALL_TASKS, () => {
    requestUpdateTaskListInterface();
    TaskList.resetActiveList();
})

PubSub.subscribe(TASK_MODIFICATION, (msg, changeObject) => {
    if ('title' in changeObject) {
        if (!validateTitle(changeObject.title)) return -1;
    }

    const taskForModification = TaskList.getTaskById(changeObject.id);

    for (const [key, value] of Object.entries(changeObject)) {
        if (taskForModification[key] === value) continue;
        taskForModification[key] = value;

        if (key === 'nonFormattedDueDate') {
            if (value === '') taskForModification.dueDate = '';
            else
                taskForModification.dueDate = getDate(value);
        }
    }

    requestUpdateTaskListInterface();
});

PubSub.subscribe(EDIT_TASK, (msg, selectedTask) => {
    const task = TaskList.getTaskById(selectedTask);

    showEditTaskDialog(task.id, task.title, task.nonFormattedDueDate, task.priority, task.note);
});

PubSub.subscribe(DELETE_TASK, (msg, id) => {
    TaskList.deleteTask(id);

    requestUpdateTaskListInterface();
});

PubSub.subscribe(POPULATE_LIST_SELECT_REQUEST, () => {
    populateListSelect(TaskList.allLists);
})

//get better looking date form
function getDate(string) {
    const year = parseInt(string.substr(0, 4));
    const month = parseInt(string.substr(5, 2));
    const day = parseInt(string.substr(8, 2));

    const date = new Date(year, month - 1, day);

    if (isToday(date)) {
        return 'Today';
    } else if (isTomorrow(date)) {
        return 'Tomorrow';
    }
    else if (isThisWeek(date)) {
        return format(date, 'cccc');
    }

    return format(date, 'd MMM y');
}

function generateId() {
    return `${TaskList.getActiveList().title.toLowerCase().replaceAll(' ', '')}-` + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 10000);
}

function validateTitle(title) {
    if (title.length < 2) {
        showMessage('Title you entered is too short.');
        return false;
    }

    return true;
}

//preloaded tasks
if(TaskList.findByTitle('My List') === undefined){const defaultList = new TaskList('My List');

new Task('Clean the bathroom', 'My List', '2024-08-03', 'high', '');
new Task('Pick up new clothes', 'My List', '2024-08-04', 'medium', '');
new Task('Read 20 pages of the book', 'My List', '2024-09-01', 'low', ''); 
new Task('Call Sarah', 'My List', '2024-08-23', 'high', '');
new Task('Journaling', 'My List', '2024-08-23', 'high', '');
new Task('Organize Closet', 'My List', '2024-08-23', 'medium', '');

new TaskList('Groceries');
new Task('Oat milk', 'Groceries', '2024-08-01', 'medium', '');
new Task('Strawberries', 'Groceries', '2024-08-01', 'medium', '');
new Task('Chicken', 'Groceries', '2024-08-01', 'medium', '');
new Task('Oranges', 'Groceries', '2024-08-01', 'medium', '');
new Task('Almonds', 'Groceries', '2024-08-01', 'medium', '');

new TaskList('Gym');
new Task('Recovery Time', 'Gym', '2024-08-01', 'medium', 'Do a 10-minute foam rolling session to aid recovery.');
new Task('Strength Training', 'Gym', '2024-08-01', 'medium', 'Focus on upper body exercises.');

defaultList.setAsActive();
requestUpdateTaskListInterface();}