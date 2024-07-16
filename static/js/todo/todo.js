axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    data: function () {
        return {
            allTasks: [],
            newTask: false,
            newTaskValue: "",
            editId: null,
            oldTask: {}
        }
    },
    mounted: function () {
        this.getTasks();
    },
    methods: {
        getTaskfromId: function (id) {
            return this.allTasks.find(task => task.id === id);
        },
        getTasks: async function () {
            try {
                let response = await axios.get('/api/v1/list');
                this.allTasks = response.data;
            } catch (e) {
                console.log("Error", e);
                alert("Unable to fetch tasks. Some error occured!", e);
            }
        },
        editMode: function (id) {
            this.editId = id;
            this.oldTask = {...this.getTaskfromId(id)}; // Shallow copy
        },
        deleteTask: async function (id) {
            try {
                await axios.delete('/api/v1/delete/' + id);
                this.allTasks = this.allTasks.filter((task) => task.id !== id);
            } catch (error) {
                console.log("Error", error);
                alert("Unable to delete task. Some error occured!", error);
            }
        },
        save: async function (id) {
            try {
                await axios.post('/api/v1/update/' + id, this.getTaskfromId(id));
                this.editId = null;
                this.oldTask = {};
            } catch (error) {
                console.log("Error", error);
                alert("Unable to edit the task.", error);
            }
        },
        cancel: function (id) {
            this.editId = null;
            const index = this.allTasks.findIndex(task => task.id === id);
            if (index !== -1) {
                this.allTasks[index] = {...this.oldTask}; // Restore oldTask using spread operator
            }
            this.oldTask = {}; // Clear oldTask
        },

        toggleAddTask: function () {
            this.newTask = !this.newTask;
            this.newTaskValue = "";
        },
        submitNewTask: async function () {
            let newTask = {
                title: this.newTaskValue,
                completed: false
            };

            try {
                const response = await axios.post('/api/v1/create', newTask);
                this.newTask = false; // Hide the new task input form
                this.allTasks.push(response.data); // Add the new task to the local array
                this.newTaskValue = ""; // Clear the input field for new task
            } catch (error) {
                console.error("Error creating task:", error);
                alert("Unable to add new task", error);
            }
        }

    }
})
