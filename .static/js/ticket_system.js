axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

const app = Vue.createApp({
        delimiters: ['[[', ']]'],
        data() {
            return {
                tickets: [],
                newTicket: {content: '', subject: '', type: ''},
                selectedTicket: null,
                selectedTicketReplies: null,
                isRepliesOpen: false,
                formVisible: false,
                formRenderInstance: null,
                addedTicket: null
            };
        },
        methods: {
            fetchTickets() {
                axios.get(ticketsListCreateApiUrl)
                    .then(response => {
                        console.log(response.data.results)
                        this.tickets = response.data.results; // Adjust based on the response structure
                    })
                    .catch(error => console.error('Error fetching tickets:', error));

            },
            toggleForm() {
                this.formVisible = !this.formVisible;
            },
            toggleReplies(ticketId) {
                this.isRepliesOpen = !this.isRepliesOpen;
                this.selectedTicketReplies = ticketId;
            },
            createTicket() {
                axios.post(ticketsListCreateApiUrl, this.newTicket)
                    .then(response => {
                        this.tickets.push(response.data);
                        this.newTicket = {content: '', subject: '', type: ''};
                    })
                    .catch(error => console.error('Error creating ticket:', error));
            },
            handleReplyClick(event, ticketId) {
                let content = event.target.value.trim();
                axios.post(ticketReplyCreateApiUrl.replace('0000', ticketId), {'content': content})
                    .then(response => {
                        const ticket = this.tickets.find(t => t.id === ticketId);
                        if (ticket) {
                            ticket.replies.push(response.data);
                        }
                        alert("success");
                    })
                    .catch(error => console.error('Error creating reply:', error));
            },
            selectTicket(ticket) {
                this.selectedTicket = this.selectedTicket && this.selectedTicket.id === ticket.id ? null : ticket;
            },
            initForm() {
                const formData = [
                    {
                        "type": "text",
                        "label": "Text Field",
                        "placeholder": "Enter text",
                        "className": "form-control",
                        "name": "text-field"
                    },
                    {
                        "type": "textarea",
                        "label": "Textarea",
                        "placeholder": "Enter more text",
                        "className": "form-control",
                        "name": "textarea"
                    },
                    {
                        "type": "select",
                        "label": "Select",
                        "className": "form-control",
                        "name": "select",
                        "values": [
                            {"label": "Option 1", "value": "option-1"},
                            {"label": "Option 2", "value": "option-2"}
                        ]
                    }
                ];

                const wrap = $('.render-wrap');
                const formRender = wrap.formRender();
                this.formRenderInstance = formRender;
                wrap.formRender('render', formData);
            },
            exportFormData() {

                console.log('Exported Form Data:', JSON.stringify(this.formRenderInstance.userData));

                let newUserData = this.formRenderInstance.userData
                newUserData.map(function (field) { // Disable stuff
                    field.disabled = true;
                    return field;
                })

                // Add your logic to save the form data to your backend here.
                const wrap = $('.render-wrap-result');
                const formRender = wrap.formRender();
                this.formRenderInstance = formRender;
                wrap.formRender('render', JSON.stringify(newUserData));

                this.$nextTick(() => {
                    this.addedTicket = true
                });
            }
        },
        mounted() {
            this.initForm();
            this.fetchTickets();
        }
    })
;

app.mount('#app');
