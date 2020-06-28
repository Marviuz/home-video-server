<template>
  <v-container>
    <v-toolbar>
      <v-btn icon large :to="upperLevelTo" v-if="$route.path !== '/'">
        <v-icon>mdi-arrow-up</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn-toggle v-model="display" mandatory>
        <v-btn>
          <v-icon>mdi-view-grid</v-icon>
        </v-btn>
        <v-btn>
          <v-icon>mdi-view-list</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-toolbar>

    <v-row v-if="display === 0">
      <v-col cols="6" sm="4" md="3" lg="2" v-for="item in items" :key="JSON.stringify(item)">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-card
              v-on="on"
              v-bind="attrs"
              exact
              v-if="item.isDir"
              :key="JSON.stringify(item)"
              :to="{ path: item.hyperlink.href, query: { root: item.hyperlink.root } }"
            >
              <v-container>
                <v-row justify="center">
                  <v-avatar :size="100">
                    <v-icon :size="100">mdi-folder</v-icon>
                  </v-avatar>
                </v-row>
              </v-container>
              <v-card-title>
                <div class="text-truncate">{{item.name}}</div>
              </v-card-title>
              <v-card-subtitle>
                <div class="text-truncate">{{item.src}}</div>
              </v-card-subtitle>
            </v-card>

            <v-card
              v-on="on"
              v-bind="attrs"
              exact
              v-else
              :key="JSON.stringify(item)"
              :to="{ path: '/watch' + item.hyperlink.href, query: { root: item.hyperlink.root } }"
            >
              <v-container>
                <v-row justify="center">
                  <v-avatar :size="100">
                    <v-icon :size="100">mdi-play-circle</v-icon>
                  </v-avatar>
                </v-row>
              </v-container>
              <v-card-title>
                <div class="text-truncate">{{item.name}}</div>
              </v-card-title>
              <v-card-subtitle>
                <div class="text-truncate">{{item.src}}</div>
              </v-card-subtitle>
            </v-card>
          </template>
          <span class="text-h6">{{item.name}}</span>
        </v-tooltip>
      </v-col>
    </v-row>

    <v-list v-else>
      <template v-for="item in items">
        <v-tooltip bottom :key="JSON.stringify(item)">
          <template v-slot:activator="{ on, attrs }">
            <v-list-item
              v-on="on"
              v-bind="attrs"
              exact
              v-if="item.isDir"
              :to="{ path: item.hyperlink.href, query: { root: item.hyperlink.root } }"
            >
              <v-list-item-avatar>
                <v-icon :size="40">mdi-folder</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{item.name}}</v-list-item-title>
                <v-list-item-subtitle>{{item.src}}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-on="on"
              v-bind="attrs"
              exact
              v-else
              :key="JSON.stringify(item)"
              :to="{ path: '/watch' + item.hyperlink.href, query: { root: item.hyperlink.root } }"
            >
              <v-list-item-avatar>
                <v-icon :size="40">mdi-play-circle</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{item.name}}</v-list-item-title>
                <v-list-item-subtitle>{{item.src}}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
          <span class="text-h6">{{item.name}}</span>
        </v-tooltip>
      </template>
    </v-list>
  </v-container>
</template>

<script>
import { getAll, getItem } from "@/services/axios";

export default {
  data() {
    const ls = localStorage.getItem("display");

    return {
      items: [],
      displayValue: ls ? parseInt(ls, 10) : 0
    };
  },
  computed: {
    display: {
      get() {
        return this.displayValue;
      },
      set(val) {
        this.displayValue = val;
        localStorage.setItem("display", val);
      }
    },
    upperLevelTo() {
      if (!this.$route.path.split("/").slice(2, -1).length)
        return { path: "/" };

      return {
        path: `/${this.$route.path
          .split("/")
          .slice(1, -1)
          .join("/")}`,
        query: { root: this.$route.query.root }
      };
    }
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