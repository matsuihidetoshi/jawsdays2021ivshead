<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :clipped="clipped"
      width="400"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in menu"
          :key="i"
          :href="i > 0 ? item.to : null"
          :to="i === 0 ? item.to : null"
          :target="i === 0 ? '' : '_blank'"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title
              class="body-2"
              v-text="item.title"
            />
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          @click="drawer = false"
        >
          <v-list-item-action>
            <v-icon>mdi-arrow-left-bold-box-outline</v-icon>
          </v-list-item-action>
          <v-list-item-title
            class="body-2"
            v-text="'Close'"
          />
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      color="#fff"
      collapse-on-scroll
      elevate-on-scroll
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
    </v-app-bar>

    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>

    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }} &nbsp; JAWS DAYS 2021</span>
    </v-footer>
    <scroll-button />
  </v-app>
</template>

<script>
import { Component, Vue } from 'nuxt-property-decorator'
import menu from '~/data/menu.json'
import ScrollButton from '~/components/ScrollButton.vue'
@Component({
  components: {
    ScrollButton
  },
  data () {
    return {
      clipped: true,
      drawer: false,
      fixed: true,
      menu,
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'JAWS DAYS 2021'
    }
  }
})
export default class Default extends Vue { }
</script>
