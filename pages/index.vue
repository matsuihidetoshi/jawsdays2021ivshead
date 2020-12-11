<template>
  <div>
    <stream-list />
  </div>
</template>

<script>
import { Component, Vue } from 'nuxt-property-decorator'
import StreamList from '~/components/streams/List.vue'

@Component({
  components: {
    StreamList
  }
})

export default class Index extends Vue { }
</script>
