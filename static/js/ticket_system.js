document.addEventListener('DOMContentLoaded', function () {

    axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
    axios.defaults.xsrfCookieName = "csrftoken";

    const app = Vue.createApp({
            template: `
                <div class="card m-5 p-5 d-flex flex-column">
                    <div class="row align-items-center">
                        <div class="col-6">
                            <a @click="toggleForm" role="button" class="btn btn-success">
                                <i class="fa fa-plus" v-if="!formVisible"></i>
                                <i class="fa fa-minus" v-else></i>
                                Add Ticket
                            </a>
                        </div>
                        <div class="col-6 text-right row">
                            <div class="col-12">
                                <h3>Tickets in last 60 days: <span>[[ totalTickets ]]</span></h3>
            
                            </div>
                            <div class="col-12 mt-1">
                                <div class="d-inline-block">
                                    <div class="media d-flex">
                                        <div class="media-body text-left">
                                            <h3 class="info"> 2 </h3>
                                            <h5>Visit Tickets</h5>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-inline-block ml-2">
                                    <div class="media d-flex">
                                        <div class="media-body text-left">
                                            <h3 class="info"> 3 </h3>
                                            <h5>Paltel Tickets</h5>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-inline-block ml-2">
                                    <div class="media d-flex">
                                        <div class="media-body text-left">
                                            <h3 class="info"> 5</h3>
                                            <h5>Support Tickets</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h4 class="card-header-hr mt-1"><i class="fa fa-bookmark"></i>
                        Service Tickets
                        <span class="float-right" id="navigation-wrapper">
                            <button class="btn btn-dark btn-sm mr-1 move-page" v-if="previous" @click="goToPreviousPage">
                                <i class="fa fa-arrow-left"></i>
                            </button>
                            <span class="mr-1">[[ currentPage ]] of [[ totalPages ]] </span>
                            <button class="btn btn-info btn-sm move-page" v-if="next" @click="goToNextPage">
                                <i class="fa fa-arrow-right"></i>
                            </button>
                        </span>
                    </h4>
                    <form v-show="formVisible" class="form form-horizontal card p-4 mt-2" id="add_ticket_form"
                          enctype="multipart/form-data" novalidate @submit.prevent="addTicket">
                        <div class="form-body mt-1">
                            <div class="row mb-2">
                                <div class="col-6">
                                    <label for="type" class="form-label">Type</label>
                                    <select id="type" v-model="selectedType" class="form-select" required>
                                        <option value="" disabled>Select Type</option>
                                        <option v-for="type in formTypes" :key="type.id" :value="type">
                                            [[ type.type ]]
                                        </option>
                                    </select>
                                </div>
                                <div class="col-6">
                                    <label for="subject" class="form-label">Subject</label>
                                    <select id="subject" v-model="selectedSubject" @change="fetchFormContent"
                                            :disabled="!selectedType" class="form-select" required>
                                        <option value="" disabled>Select Subject</option>
                                        <option v-for="subject in filteredSubjects" :key="subject.id" :value="subject">
                                            [[ subject.subject ]]
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div v-show="renderedForm" class="col-12" id="rendered-form"></div>
                                <div v-show="renderedForm == null" class="col-12">
                                    <label for="formContent" class="form-label">Content</label>
                                    <textarea name="formContent" id="formContent" class="form-control"></textarea>
                                </div>
                            </div>
                            <div class="form-actions text-center mt-3">
                                <button id="add_ticket_btn" type="submit" class="btn btn-primary">
                                    <i class="la la-check-square-o"></i> Add
                                </button>
                            </div>
                        </div>
                    </form>
                    <div class="text-center" id="ticket-loader" v-if="!tickets.length">
                        <span><i class="la la-spinner la-spin"></i> Loading...</span>
                    </div>
                    <div v-else>
                        <section id="timeline" class="timeline-left timeline-wrapper">
                            <ul id="timeline-warpper" class="timeline pt-5">
                                <li v-for="ticket in tickets" class="timeline-item">
                                    <div class="timeline-badge">
                                        <img :src="profileImage" alt="" title="">
                                    </div>
                                    <div class="timeline-line">
            
                                    </div>
            
                                    <div class="timeline-card card border-grey border-lighten-2 mr-3" style="background: #F3F4F9">
                                        <div class="card-header" style="background: #F3F4F9">
                                            <h4 class="card-title"><span
                                                    class="text-info">[[ ticket.type.type ]] - [[ ticket.subject.subject ]] - [[ ticket.status ? 'Active' : 'Closed' ]]</span>
                                            </h4>
                                            <a class="heading-elements-toggle"><i class="la la-ellipsis-h font-medium-3"></i></a>
                                            <div class="heading-elements">
                                <span class="card-subtitle text-muted d-inline-block">
                                    <span class="font-small-3 d-block">Created on [[ ticket.created_on ]]</span>
                                    <span class="font-small-3 d-block"
                                          v-if="ticket.closed_on">Closed on [[ ticket.closed_on ]]</span>
                                    <span class="font-small-3 d-block" v-if="ticket.transfered_on">Transfered on [[ ticket.transfered_on ]]</span>
                                </span>
                                            </div>
                                        </div>
                                        <div class="card-content">
                                            <div class="card-body">
                                                <div class="row">
                                                    <div class="col-12">
                                                        <div class="pb-2" :id="'ticket-content-' + ticket.id"
                                                             v-html="ticket.content"></div>
                                                        <ul class="list-inline mb-1">
                                                            <li class="pr-1">
                                                                <a class="button-close-ticket text-muted"
                                                                   @click="closeTicket(ticket.id)"><i
                                                                        class="fa fa-dribbble"></i>
                                                                    Close</a>
                                                            </li>
                                                            <li class="pr-1">
                                                                <a role="button"
                                                                   class="text-muted" @click="toggleReplies(ticket.id)">
                                                                    <span class="fa fa-comments"></span> Replies -
                                                                    [[ ticket.replies.length ]]
                                                                    <i class="fa fa-angle-double-right text-success"
                                                                       v-if="!isRepliesOpen"></i>
                                                                    <i class="fa fa-angle-double-down text-success" v-else></i>
                                                                </a>
                                                            </li>
                                                        </ul>
                                                        <div v-if="ticket.id == selectedTicketReplies && isRepliesOpen">
            
                                                            <div v-for="reply in ticket.replies" class="media mb-1" :key="reply.id">
                                                                <div class="media-left pr-1">
            
                                                                    <a href="#">
            
                                                                    <span class="avatar avatar-online">
                                                                        <img :src="profileImage" alt="avatar">
                                                                    </span>
                                                                    </a>
                                                                </div>
                                                                <div class="media-body">
            
                                                                    <p class="text-bold-600 mb-0">
                                                                        <span class="float-right">[[ reply.created_on]] </span>
                                                                    </p>
                                                                    <p class="m-0 mb-1">[[ reply.content]]</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="form-group position-relative">
                                                            <div class="input-group">
                                                                <div class="input-group-prepend">
                                                                    <button
                                                                            class="input-group-text bg-success text-white border-0 rounded-left btn"
                                                                            @click="handleReplyClick($event, ticket.id)">
                                                                        <i class="fa fa-reply fa-lg success"></i>
                                                                    </button>
                                                                </div>
                                                                <input
                                                                        type="text"
                                                                        class="form-control border-0 rounded-right shadow-sm"
                                                                        placeholder="Reply to Ticket..."
                                                                        style="padding: 10px 15px; font-size: 16px;"
                                                                        @keyup.enter="handleReplyClick($event, ticket.id)">
                                                            </div>
                                                        </div>
            
            
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            `,
            delimiters: ['[[', ']]'],
            data() {
                return {
                    tickets: [],
                    next: null,
                    previous: null,
                    totalPages: null,
                    currentPage: 1,
                    newTicket: {content: '', subject: '', type: ''},
                    selectedTicket: null,
                    selectedTicketReplies: null,
                    isRepliesOpen: false,
                    formVisible: false,
                    formRenderInstance: null,
                    addedTicket: null,
                    formTypes: [],
                    selectedType: null,
                    subjects: [],
                    selectedSubject: null,
                    renderedForm: null,
                    formContent: '',
                    totalTickets: 0,
                    profileImage: null
                };
            },
            computed: {
                filteredSubjects: function () {
                    if (this.selectedType)
                        return this.subjects.filter((subject) => subject.type__id === this.selectedType.id);
                },
            },
            methods: {
                initCkEditorFormContent() {
                    CKEDITOR.replace('formContent', {
                        toolbar: [
                            ['Bold', 'Italic', 'Underline'],
                            ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
                            ['Link', 'Unlink'],
                            ['RemoveFormat',]
                        ]
                    });
                },
                fetchFormTypes: async function () {
                    try {
                        const response = await axios.get(loadTicketTypes);
                        this.formTypes = response.data;
                    } catch (error) {
                        console.error('Error fetching form types:', error);
                    }
                },
                fetchFormSubjects: async function () {
                    try {
                        const response = await axios.get(loadTicketSubjects);
                        this.subjects = response.data;
                    } catch (error) {
                        console.error('Error fetching form subjects:', error);
                    }
                },
                fetchFormContent: async function () {
                    if (!this.selectedSubject) return;

                    try {
                        CKEDITOR.instances.formContent.setData('');
                        const response = await axios.get(loadTicketTemplate.replace('0000', this.selectedType.id).replace('1111', this.selectedSubject.id));
                        const formData = response.data['template']
                        console.log(formData);
                        if (formData) {
                            var formRenderOptions = {formData};
                            var frInstance = $('#rendered-form').formRender(formRenderOptions);
                            this.renderedForm = frInstance;
                        } else {
                            console.log("no template")
                            this.renderedForm = null;
                        }
                    } catch (error) {
                        // Keep ckeditor
                        console.error(error)
                        console.log("error")
                        this.renderedForm = null;
                    }

                },
                renderTicketsContent() {
                    // Handle form renderer stuff
                    for (const ticket of this.tickets) {
                        this.$nextTick(() => {
                            try {
                                var formRenderOptions = {formData: ticket.content};
                                $(`#ticket-content-${ticket.id}`).formRender(formRenderOptions);
                            } catch (error) {
                                // Not renderable - continue
                                //  v-html="ticket.content"
                            }
                        })
                    }
                },
                goToNextPage: async function () {
                    if (this.next == null) return;
                    await this.fetchTickets(this.next);
                }, goToPreviousPage: async function () {
                    if (this.previous == null) return;
                    await this.fetchTickets(this.previous);
                },
                fetchTickets: async function (url = null) {
                    try {

                        const response = await axios.get(url ? url : ticketsListCreateApiUrl);

                        this.totalTickets = response.data.count
                        this.currentPage = response.data.current_page;
                        this.totalPages = response.data.total_pages;
                        this.tickets = response.data.results;
                        this.next = response.data.next;
                        this.previous = response.data.previous;

                        this.renderTicketsContent();

                    } catch (error) {
                        console.error('Error fetching tickets:', error);
                    }


                },
                toggleForm() {
                    this.formVisible = !this.formVisible;
                },
                toggleReplies(ticketId) {
                    this.isRepliesOpen = !this.isRepliesOpen;
                    this.selectedTicketReplies = ticketId;
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
                disableRenderedFormFields: function (userData) {
                    return userData.map(field => {
                        field.disabled = true;
                        return field;
                    });
                },
                addTicket: async function () {
                    let content = '';
                    if (this.renderedForm) {
                        const userData = this.disableRenderedFormFields(this.renderedForm.userData);
                        content = JSON.stringify(userData);
                    } else {
                        content = CKEDITOR.instances.formContent.getData();
                    }

                    const newTicket = {
                        'content': content,
                        'subject': this.selectedSubject.id,
                        'type': this.selectedType.id,
                    }

                    try {
                        const response = await axios.post(ticketsCreateApiUrl, newTicket);
                        this.tickets.unshift(response.data)
                        this.toggleForm()
                        this.selectedType = null;
                        this.selectedSubject = null;
                        if (this.renderedForm) {
                            this.renderedForm = null;
                        } else {
                            CKEDITOR.instances.formContent.setData('');
                        }

                        this.renderTicketsContent();
                    } catch (error) {
                        console.error('Error creating ticket:', error)
                    }
                },
                closeTicket: async function (ticketId) {
                    try {
                        const response = await axios.patch(closeTicketUrl.replace('0000', ticketId));
                        const index = this.tickets.findIndex(t => t.id === ticketId);
                        this.tickets[index].status = response.data.status;
                        this.tickets[index].closed = response.data.closed_on;
                    } catch (error) {
                        console.error('Error closing ticket:', error)
                    }
                }
            },

            mounted: async function () {
                this.profileImage = profileImage
                this.initCkEditorFormContent();
                await this.fetchFormTypes();
                await this.fetchFormSubjects();
                await this.fetchTickets();
            }
        })
    ;

    app.mount('#app');
});
