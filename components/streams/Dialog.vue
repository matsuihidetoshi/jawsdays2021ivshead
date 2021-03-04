<template>
  <v-dialog
    v-model="dataDialog"
    width="500"
  >
    <v-card>
      <v-card-title class="headline grey lighten-2">
        確認
      </v-card-title>

      <v-card-text
        class="mt-4"
      >
        {{ value + 1 }} に投票しますか？
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          class="font-weight-bold"
          @click="back(), dataDialog = false"
        >
          戻る
        </v-btn>

        <v-btn
          class="font-weight-bold"
          color="primary"
          @click="post(), dataDialog = false"
        >
          投票！
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    value: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      dataDialog: this.dialog
    }
  },
  watch: {
    dialog () {
      this.dataDialog = this.dialog
    },
    dataDialog () {
      if (this.dataDialog === false) { this.$emit('back') }
    }
  },
  methods: {
    post () {
      this.$emit('after-post')
    },
    back () {
      this.$emit('back')
    }
  }
}
</script>
