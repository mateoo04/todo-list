import './style.css'
import { setUpUserInterface } from './dommanager.js'

class TaskList {
    tasks = [];
    static allLists = [];
    static activeList = this;

    constructor(title) {
        this.title = title;
        TaskList.allLists.push(this);
        TaskList.activeLst = this;
    }

    static findByTitle(title) {
        return TaskList.allLists.find(list => list.title === title);
    }

    static getActiveList(){
        return this.activeList;
    }

    addTask(task) {
        this.tasks.push(task);
    }

    setAsActive() {
        TaskList.activeList = this;
    }
}

class Task {
    constructor(title, dueDate = '', priority = '', note = '') {
        this.title = title;
        this.dueDate = dueDate;
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

let testTask = new Task('test', '6');
console.log(defaultList.tasks[0].dueDate);