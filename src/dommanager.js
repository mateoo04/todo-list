import PubSub from 'pubsub-js'

const taskList = document.querySelector('.task-list');

export function setUpUserInterface() {
    //Add tast ('+') button click listener
    const addTaskButton = document.querySelector('.add-task');
    const newTaskDialog = document.querySelector('.new-task-dialog');

    addTaskButton.addEventListener('click', () => {
        console.log('clicked');
        newTaskDialog.showModal();
    });

    const newTaskForm = document.querySelector('.new-task-dialog form');
    newTaskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = document.querySelector('#title-input').value;
        const dueDate = document.querySelector('#due-date-input').value;
        const priority = document.querySelector('#priority-input').value;
        const note = document.querySelector('#note-input').value;

        newTaskForm.reset();

        // console.log(title, dueDate, priority, note);

        const FORM_SUBMITTED = 'form submitted';

        // PubSub.publish(FORM_SUBMITTED, new Task(title, dueDate, priority, note));
        PubSub.publish(FORM_SUBMITTED, {
            title: title,
            dueDate: dueDate,
            priority: priority,
            note: note
        });

    });

    //closeDialogButton click listener
    const closeDialogButton = document.querySelector('.close-dialog-button');
    closeDialogButton.addEventListener('click',()=>{
        newTaskDialog.close();
    })
};

export function updateTaskList(list){
    taskList.innerHTML = '';
    console.log('updateTaskList called');

    for(let i = 0; i < list.tasks.length; i++){
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id= list.tasks[i].title;

        const taskTitle = document.createElement('p');
        taskTitle.classList.add('task-title');
        taskTitle.textContent = list.tasks[i].title;

        const taskDueDate = document.createElement('p');
        taskDueDate.classList.add('task-due-date');
        taskDueDate.textContent = list.tasks[i].dueDate;

        const detailsButton = document.createElement('button');
        detailsButton.classList.add('details-button');
        detailsButton.textContent = 'DETAILS';

        const deleteTaskButton = document.createElement('button');
        deleteTaskButton.classList.add('delete-task-button');
        deleteTaskButton.textContent = 'DELETE';

        taskItem.append(checkbox, taskTitle, taskDueDate, detailsButton, deleteTaskButton);
        taskList.append(taskItem);
    }
}