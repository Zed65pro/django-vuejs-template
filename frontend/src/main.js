import {createApp} from 'vue';
import AccountingChart from './components/AccountingChart.vue';
import Tickets from "./components/Tickets.vue";

// Mapping component names to their respective Vue components
const componentRegistry = {
    'accounting-chart': AccountingChart,  // Ensure the component name matches your template class
    'tickets': Tickets
};

// Function to mount Vue components to elements with specific classes
const mountComponents = () => {
    Object.keys(componentRegistry).forEach(componentId => {
        let element;
        switch (componentId) {
            case 'accounting-chart':
                element = document.getElementById(componentId);
                if (element) {
                    const props = {
                        radiusUsage: JSON.parse(element.getAttribute('data-prop-radius-usage')),
                        showServiceSpeedUrl: element.getAttribute('data-prop-show-service-speed-url'),
                    };
                    createApp(componentRegistry[componentId], props).mount(element);
                }
                break;
            case 'tickets':
                element = document.getElementById(componentId);
                if (element) {
                    const props = {
                        ticketsListCreateApiUrl: element.getAttribute('data-prop-ticket-list'),
                        ticketsCreateApiUrl: element.getAttribute('data-prop-ticket-create'),
                        ticketReplyCreateApiUrl: element.getAttribute('data-prop-ticket-reply-create-api'),
                        loadTicketTypes: element.getAttribute('data-prop-load-ticket-types'),
                        loadTicketSubjects: element.getAttribute('data-prop-load-ticket-subjects'),
                        loadTicketTemplate: element.getAttribute('data-prop-load-ticket-template'),
                        closeTicketUrl: element.getAttribute('data-prop-close-ticket-url'),
                        profileImage: element.getAttribute('data-prop-profile-image'),
                    };
                    createApp(componentRegistry[componentId], props).mount(element);
                }
                break;
            default:
                break;
        }
    });
};

// Wait for the DOM to be fully loaded before mounting components
document.addEventListener('DOMContentLoaded', mountComponents);
