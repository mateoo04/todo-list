import PubSub from 'pubsub-js'

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

        const title = document.querySelector('#title').value;
        const dueDate = document.querySelector('#due-date').value;
        const priority = document.querySelector('#priority').value;
        const note = document.querySelector('#note').value;

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
};