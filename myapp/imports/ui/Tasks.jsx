import { useState } from "react";
import { TaskCollection } from "../api/tasks";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

export const Tasks = () => {
    const [task, setTask] = useState('');

    //Note hook useTracker allows automatic re-render of the component when the data changes.
    const { items, isLoading } = useTracker(() => {
        const handler = Meteor.subscribe('tasks.all'); //SUBSCRIPTION to publication defined in server/main.js

        return{
            items: TaskCollection.find({}).fetch(), //READ from the collection (fetch all tasks from the Tasks collection)
            isLoading: !handler.ready(),
        }
    });

    //Define methods to add/remove tasks from the collection.
    const addTask = () => {
        Meteor.call('tasks.insert', task); //Call the method defined in server/main.js to insert a new task into the collection.
        setTask(''); //Clear the input field after adding a task.
    };

    const removeTask = (id) => {
        Meteor.call('tasks.remove', id); //Call the method defined in server/main.js to remove a task from the collection.
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    //UI to display the list of tasks and a form to add new tasks. 
    //Each task has a remove button to delete it from the collection.
    return (
        <div>
            <h2>Tasks</h2>
            <input value={task}
            onChange={(e) => setTask(e.target.value)} />
            <button onClick={addTask}>Add Task</button>

            <ul>
                {items.map((item) => (
                    <li key={item._id}>
                        {item.text}
                        <button onClick={() => removeTask(item._id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    )
};