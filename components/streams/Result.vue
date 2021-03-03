<template>
  <v-dialog
    v-model="dataDisplay"
    :max-width="500"
  >
    <v-card>
      <v-card-title class="headline grey lighten-2">
        投票結果！
      </v-card-title>

      <doughnut-chart
        :chart-data="result"
        :options="options"
        class="ma-5"
      />

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          class="font-weight-bold"
          @click="dataDisplay = false"
        >
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    display: {
      type: Boolean,
      default: false
    },
    result: {
      type: Object,
      default: () => {}
    },
    options: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      dataDisplay: this.display
    }
  },
  watch: {
    display () {
      this.dataDisplay = this.display
    },
    dataDisplay () {
      if (this.dataDisplay === false) { this.$emit('back') }
    }
  }
}
</script>
