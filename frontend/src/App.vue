<template>
  <AccountingChart :showServiceSpeedUrl="showServiceSpeedUrl" :radiusUsage="radiusUsage" />
</template>

<script>
import AccountingChart from './components/AccountingChart.vue'

export default {
  name: 'App',
  components: {
    AccountingChart
  },
  props: ['showServiceSpeedUrl', 'radiusUsage']
}
</script>