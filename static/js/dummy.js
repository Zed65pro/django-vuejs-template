axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

new Vue({
        el: '#app',
        delimiters: ['[[', ']]'],
        data: {
            states: [],
            newState: {
                name: '',
                abbreviation: ''
            }
        },
        mounted() {
            this.fetchStates();
        },
        methods: {
            fetchStates() {
                axios.get('/api/v1/states/')
                    .then(response => {
                        this.states = response.data;
                    })
                    .catch(error => {
                        console.error('Error fetching states', error);
                    });
            },
            addState() {
                console.log("FUCKAKSUAD");
                axios.post('/api/v1/states/', this.newState)
                    .then(response => {
                        this.newState.name = '';
                        this.newState.abbreviation = '';
                        this.fetchStates();
                    })
                    .catch(error => {
                        console.error('Error adding state', error);
                    });
            },
            editState(state) {
                axios.put(`/api/v1/states/${state.id}/`, state)
                    .then(response => {
                        this.newState.name = '';
                        this.newState.abbreviation = '';
                        this.fetchStates();
                    })
                    .catch(error => {
                        console.error('Error adding state', error);
                    });
                console.log('Editing state', state);
            },
            deleteState(stateId) {
                axios.delete(`/api/v1/states/${stateId}/`)
                    .then(response => {
                        this.fetchStates();
                    })
                    .catch(error => {
                        console.error('Error deleting state', error);
                    });
            }
        }
    });