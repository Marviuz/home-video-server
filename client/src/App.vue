<template>
  <v-app dark>
    <v-app-bar app>
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-keyboard-backspace</v-icon>
      </v-btn>

      <v-spacer></v-spacer>

      <v-combobox
        :menu-props="{closeOnContentClick: true}"
        :filter="handleSearch"
        :items="animes"
        solo
        hide-details
        label="Search"
        clearable
      >
        <template v-slot:item="{ index, item }">
          <v-list-item
            exact
            :key="`${JSON.stringify(item)}-${index}`"
            :to="{ name: 'Animes', query: { dir: item.name, root: item.src } }"
          >
            <v-list-item-icon>
              <v-icon>mdi-folder</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{item.name}}</v-list-item-title>
              <v-list-item-subtitle>{{item.src}}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-combobox>

      <v-spacer></v-spacer>

      <template v-if="$route.query.root">
        <v-btn icon to="/">
          <v-icon>mdi-home</v-icon>
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import axios from "@/services/axios";

export default {
  data() {
    return {
      animes: [],
      search: null
    };
  },
  created() {
    axios.get("/animes").then(_ => (this.animes = _.data));
  },
  methods: {
    handleSearch({ ext, isDir, name, src }, query) {
      const search = query
        .toLowerCase()
        .replace(/[!@#$%^&*(),.?":{}|<>]/g, " ")
        .trim()
        .split(" ");

      for (const item of search) {
        if (
          name.toLowerCase().includes(item.toLowerCase()) ||
          src
            .toLowerCase()
            .replace(/[!@#$%^&*(),.?":{}|<>]/g, " ")
            .includes(item.toLowerCase())
        )
          return true;
      }

      return false;
    }
  }
};
</script>