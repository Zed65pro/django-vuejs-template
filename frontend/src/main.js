import {createApp} from 'vue';
import AccountingChart from './components/AccountingChart.vue';

// Mapping component names to their respective Vue components
const componentRegistry = {
    'accounting-chart': AccountingChart,  // Ensure the component name matches your template class
};

// Function to mount Vue components to elements with specific classes
const mountComponents = () => {
    Object.keys(componentRegistry).forEach(componentId => {
        switch (componentId) {
            case 'accounting-chart':
                const element = document.getElementById(componentId);
                if (element) {
                    const props = {
                        radiusUsage: JSON.parse(element.getAttribute('data-prop-radius-usage')),
                        showServiceSpeedUrl: element.getAttribute('data-prop-show-service-speed-url'),
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
