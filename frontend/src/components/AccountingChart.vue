<template>
  <div>
    <button @click="toggleChart" class="btn btn-success">
      <i v-if="!chartVisible" class="ft-plus"></i>
      <i v-if="chartVisible" class="ft-minus"></i>
      Show Charts
    </button>
    <div v-show="chartVisible" class="row">
      <div class="col-12 col-md-6">
        <canvas id="accountingChart"></canvas>
      </div>
      <div class="col-12 col-md-6">
        <canvas id="monthlyUsageChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import {shallowRef} from "vue";
import Chart from 'chart.js/auto';
import axios from 'axios';
import 'chartjs-adapter-moment';

export default {
  name: 'AccountingChart',
  props: {
    showServiceSpeedUrl: {
      type: String,
      required: true
    },
    radiusUsage: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chartVisible: false,
      chart: shallowRef(null),
      chartData: {
        labels: [],
        datasets: [
          {
            data: [],
            borderWidth: 2,
            pointRadius: 0,
            lineTension: 0,
            fill: true,
            borderColor: '#5def0e',
            backgroundColor: 'rgba(93,239,14,0.2)',
            label: 'Download',
          }, {
            data: [],
            borderWidth: 2,
            pointRadius: 0,
            lineTension: 0,
            fill: true,
            borderColor: '#ef1c0d',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            label: 'Upload',
          }
        ]
      },
      refreshSpeedIntervalCall: null,
      // Bar chart data
      barChart: null,
      bardata: null,
      barChartData: null
    };
  },
  methods: {
    toggleChart() {
      this.chartVisible = !this.chartVisible;
      if (!this.chart) {
        this.createChart();
      }

      if (!this.barChart) {
        this.createBarChart();
      }
    },
    registerFetchChartDataListener() {
      this.getDataFromApi();
      if (!this.refreshSpeedIntervalCall) {
        this.refreshSpeedIntervalCall = setInterval(this.getDataFromApi, 10000);
      }
    },
    createChart() {
      const ctx = document.getElementById("accountingChart").getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
        spanGaps: false,
        data: this.chartData,
        options: {
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            title: {
              display: true,
              text: "Accounting Speed",
            },
            tooltip: {
              callbacks: {
                label: (tooltipItems) => {
                  let data = tooltipItems.dataset.label;
                  if (data) data += ' - ';
                  return data + this.kbToString(tooltipItems.parsed.y);
                },
              }
            }
          },
          responsive: true,
          legend: {
            display: true
          },
          scales: {
            y: {
              suggestedMin: 0,
              suggestedMax: 50,
              ticks: {
                callback: (label) => {
                  return this.kbToString(label);
                }
              }
            },
            x: {
              type: 'time',
              time: {
                unit: 'minute'
              },
              ticks: {
                source: 'data',
                maxTicksLimit: 5.1,
                autoSkip: true,
              }
            },
          }
        }
      });
    },
    createBarChart() {
      if (this.barChartData == null) return;
      const ctx = document.getElementById("monthlyUsageChart").getContext('2d');
      this.barChart = new Chart(ctx, {
        type: 'bar',
        data: this.barChartData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
              suggestedMin: 0,
              ticks: {
                callback: function (label, index, labels) {
                  return label + ' Gb';
                }
              },
            }
          },
          responsive: true,
          legend: {
            position: 'top',
          },
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            title: {
              display: true,
              text: "Daily Average in last three months",
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItems) {
                  let data = tooltipItems.dataset.label;
                  if (data) data += ' - ';
                  data += tooltipItems.parsed.y + ' Gb';
                  return data;
                }
              }
            }
          },
        },
      });
    },
    initBarChartData() {
      this.barData = this.radiusUsage;

      if (this.barData == null) return;
      console.log(this.barData['current']['download']);

      this.barChartData = {
        labels: ['Current Month', 'One Month Ago', 'Two months Ago'],
        datasets: [{
          label: 'Download',
          borderColor: '#5def0e',
          backgroundColor: 'rgba(93,239,14,0.2)',
          borderWidth: 2,
          data: [this.barData['current']['download'], this.barData['one']['download'], this.barData['two']['download']],
        },
          {
            label: 'Upload',
            borderColor: '#ef1c0d',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            data: [this.barData['current']['upload'], this.barData['one']['upload'], this.barData['two']['upload']],
          }]
      }
    },
    getDataFromApi() {
      console.log(this.showServiceSpeedUrl);
      axios.get(this.showServiceSpeedUrl)
          .then(response => {
            const data = response.data;

            const newLabel = new Date();
            const newDownload = data['download'];
            const newUpload = data['upload'];

            // Use deep copies of the data arrays
            const newLabels = [...this.chartData.labels, newLabel];
            const newDownloadData = [...this.chartData.datasets[0].data, newDownload];
            const newUploadData = [...this.chartData.datasets[1].data, newUpload];

            // Update chartData with new data
            this.chartData.labels = newLabels;
            this.chartData.datasets[0].data = newDownloadData;
            this.chartData.datasets[1].data = newUploadData;


            if (this.chart) {
              this.chart.update();
            }
          })
          .catch(error => {
            // TODO: handle error
          });
    },
    kbToString(kb) {
      const bytes = parseFloat(kb);
      if (bytes < 1000) {
        return bytes.toFixed(2) + ' Kb';
      } else if (bytes < 1000 * 1000) {
        return (bytes / 1000).toFixed(2) + ' Mb';
      } else {
        return (bytes / 1000 / 1000).toFixed(2) + ' Gb';
      }
    }
  },
  mounted() {
    this.initBarChartData();
    this.registerFetchChartDataListener();
  },
  unmounted() {
    clearInterval(this.refreshSpeedIntervalCall);
  }
};
</script>