axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
const {createApp} = Vue;

// Debounce function
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;

        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

createApp({
    delimiters: ['[[', ']]'],
    data() {
        return {
            allTasks: [],
            searchQuery: '',
            loading: false,
            error: null,
            isEditing: false,
            oldTitle: null,
            isConfirmDelete: false,
            taskIdToDelete: null,
            showAddTask: false,
            newTaskTitle: '',
            pagination: {
                next: null,
                previous: null,
                currentPage: 1,
                totalPages: 1
            },
            completedFilter: null
        }
    },
    mounted() {
        this.fetchTasks();
    },
    computed: {
        filteredTasks: function () {
            return this.allTasks.filter(task => task.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
        },

    },
    methods: {
        debouncedFetch: debounce(function () {
            this.fetchTasks();
        }, 500),
        fetchTasks: async function (page = 1) {
            try {
                this.loading = true;

                let completedQuery = ''
                if (this.completedFilter !== null) completedQuery = `&completed=${this.completedFilter}`;

                let response = await axios.get(`/api/v1/list?page=${page}&search=${this.searchQuery}${completedQuery}`);
                this.allTasks = response.data.results;
                this.pagination.next = response.data.next;
                this.pagination.previous = response.data.previous;
                this.pagination.currentPage = page;
                this.pagination.totalPages = Math.ceil(response.data.count / 10);
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        saveTask: async function (id, completed) {
            try {
                let response = await axios.put(`/api/v1/update/${id}`, {completed: completed});
            } catch (error) {
                alert("Unable to update the task status");
                this.error = error;
            }
        },
        saveTitleTask: async function (id, title) {
            try {
                let response = await axios.put(`/api/v1/update/${id}`, {title: title});
            } catch (error) {
                alert("Unable to update the task title");
                this.error = error;
            } finally {
                this.isEditing = false;
            }
        },
        startEditing: function (title) {
            this.oldTitle = title;
            this.isEditing = true;
        },
        cancelEditing: function (id) {
            let selectedTaskIndex = this.allTasks.findIndex((task) => task.id === id);
            this.allTasks[selectedTaskIndex].title = this.oldTitle;
            this.oldTitle = null;
            this.isEditing = false;
        },
        deleteTask: async function (id) {
            this.isConfirmDelete = true;
            this.taskIdToDelete = id;
        },
        confirmDeletion: async function () {
            try {
                console.log("sadasdasd");
                await axios.delete(`/api/v1/delete/${this.taskIdToDelete}`);
                this.allTasks = this.allTasks.filter((task) => task.id !== this.taskIdToDelete);

                if (!this.allTasks.length) await this.fetchTasks();
            } catch (error) {
                this.error = error;
            } finally {
                this.isConfirmDelete = false;
                this.taskIdToDelete = null;
            }
        },
        cancelDelete: function () {
            this.isConfirmDelete = false;
            this.taskIdToDelete = null;
        },
        showAddTaskModal: function () {
            this.showAddTask = true;
        },
        cancelAddTask: function () {
            this.showAddTask = false;
            this.newTaskTitle = '';
        },
        addTask: async function () {
            let newTask = {
                title: this.newTaskTitle,
                completed: false
            };

            try {
                let response = await axios.post('/api/v1/create', newTask);

                // Insert the new task at the beginning of the allTasks array
                this.allTasks.unshift(response.data);

                // If current page has reached the page size limit, remove the last item
                if (this.allTasks.length > 10) {
                    this.allTasks.pop();
                }

                // Reset new task input and modal state
                this.newTaskTitle = '';
                this.showAddTask = false;

                if (this.pagination.totalPages === 1) {
                    this.pagination.next = 1;
                    this.pagination.totalPages += 1;
                }

            } catch (error) {
                alert("Unable to add the new task");
                this.error = error;
            }
        }

    }

}).mount('#app');
