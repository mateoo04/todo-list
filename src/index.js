import './style.css'

class TaskList {
    tasks = [];

    constructor(title) {
        this.title = title;
    }

    addTask(task) {
        this.tasks.push(task);
    }
}

class Task {
    constructor(title, dueDate = '', priority = 0, note = '') {
        this.title = title;
        this.dueDate = dueDate;
        this.priority = priority;
        this.note = note;
        this.isDone = false;
    }
}