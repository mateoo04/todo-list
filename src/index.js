import './style.css';
import { setUpUserInterface, updateTaskList, updateListsList, showMessage, showAllTasks, updateActiveListHeader } from './dommanager.js';
import PubSub from 'pubsub-js';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';

const NEW_TASK = 'new task created', NEW_LIST = 'new list created',
    ACTIVE_LIST_CHANGE = 'active list changed', SHOW_ALL_TASKS = 'show all tasks';

class TaskList {
    tasks = new Map();

    // tasks = [];
    static allLists = [];
    static activeList = this;

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

    addTask(task) {
        // this.tasks.push(task);

        this.tasks.set(generateId(), task);
    }

    setAsActive() {
        TaskList.activeList = this;
        requestUpdateActiveListHeader(this.title);

        requestTaskListUpdate();
    }
}

class Task {
    constructor(title, dueDate = '', priority = '', note = '') {
        this.title = title;

        if (dueDate != '')
            this.dueDate = getDate(dueDate);
        this.priority = priority;
        this.note = note;
        this.isDone = false;

        //add to task list
        TaskList.getActiveList().addTask(this);
    }
}

//at page loading
setUpUserInterface();

let defaultList = new TaskList('My List');
defaultList.setAsActive();

//functions which call interface updates in dommanager.js
function requestTaskListUpdate() {
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
PubSub.subscribe(NEW_TASK, (msg, data) => {
    new Task(data.title, data.dueDate, data.priority, data.note);
    requestTaskListUpdate();
});

PubSub.subscribe(NEW_LIST, (msg, data) => {
    if (data.length >= 2 && TaskList.findByTitle(data) === undefined) {
        new TaskList(data);
        requestListsListUpdate();
    } else {
        requestMessageDialog('The name you entered is either not valid or is already in use.')
    }
});

PubSub.subscribe(ACTIVE_LIST_CHANGE, (msg, data) => {
    data.setAsActive();
    requestListsListUpdate();
});

PubSub.subscribe(SHOW_ALL_TASKS, () => {
    requestShowAllTasks();
})

//get better looking date form
function getDate(string) {
    const year = parseInt(string.substr(0, 4));
    const month = parseInt(string.substr(5, 2));
    const day = parseInt(string.substr(8, 2));

    const date = new Date(year, month - 1, day);

    console.log(year, month, day);

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

//preloaded tasks
new Task('Buy oat milk', '2024-08-01', 'High', '');
new Task('Clean the bathroom', '2024-08-03', 'High', '');
new Task('Pick up new clothes', '2024-08-04', 'Medium', '');
new Task('Read 20 pages of the book', '2024-09-01', 'Low', '');

console.log(TaskList.getActiveList().tasks);

requestTaskListUpdate();