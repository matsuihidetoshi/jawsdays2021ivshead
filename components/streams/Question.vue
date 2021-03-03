<template>
  <v-card-actions>
    <v-btn
      v-for="(option, key) in options"
      :key="key"
      :color="option.color"
      class="white--text"
      @click="value = key, dialog = true"
    >
      {{ option.text }}
    </v-btn>

    <Dialog
      :dialog="dialog"
      :value="value"
      @after-post="afterPost"
      @back="back"
    />
  </v-card-actions>
</template>
<script>
import Dialog from '~/components/streams/Dialog.vue'
export default {
  components: {
    Dialog
  },
  props: {
    options: {
      type: Array,
      required: true
    },
    action: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      value: 0,
      dialog: false
    }
  },
  methods: {
    afterPost () {
      this.action(this.value)
      this.dialog = false
      this.$emit('finish-post')
    },
    back () {
      this.dialog = false
    }
  }
}
</script>
