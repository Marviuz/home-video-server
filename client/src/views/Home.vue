<template>
  <v-container>
    <v-list>
      <template v-for="item in items">
        <v-list-item
          exact
          v-if="item.isDir"
          :key="JSON.stringify(item)"
          :to="{ path: item.hyperlink.href, query: { root: item.hyperlink.root } }"
        >
          <v-list-item-icon>
            <v-icon>mdi-folder</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{item.name}}</v-list-item-title>
            <v-list-item-subtitle>{{item.src}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          exact
          v-else
          :key="JSON.stringify(item)"
          :to="{ path: '/watch' + item.hyperlink.href, query: { root: item.hyperlink.root } }"
        >
          <v-list-item-icon>
            <v-icon>mdi-play-circle</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{item.name}}</v-list-item-title>
            <v-list-item-subtitle>{{item.src}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-container>
</template>

<script>
import { getAll, getItem } from "@/services/axios";

export default {
  data() {
    return {
      items: []
    };
  },
  watch: {
    $route: {
      immediate: true,
      handler(to, from) {
        if (to.path === "/") {
          getAll().then(({ data }) => (this.items = data));
        } else {
          getItem(to.path, { root: to.query.root }).then(
            _ => (this.items = _.data)
          );
        }
      }
    }
  }
};
</script>