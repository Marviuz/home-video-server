<template>
  <v-container>
    <v-row justify="end">
      <v-btn-toggle v-model="display" mandatory>
        <v-btn>
          <v-icon>mdi-view-grid</v-icon>
        </v-btn>
        <v-btn>
          <v-icon>mdi-view-list</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-row>

    <v-row v-if="display === 0">
      <v-col cols="6" sm="4" md="3" lg="2" v-for="item in items" :key="JSON.stringify(item)">
        <v-card
          exact
          v-if="item.isDir"
          :key="JSON.stringify(item)"
          :to="{ path: item.hyperlink.href, query: { root: item.hyperlink.root } }"
        >
          <v-container>
            <v-row justify="center">
              <v-col class="flex-shrink-1 flex-grow-0">
                <v-icon :style="{fontSize: '5rem'}">mdi-folder</v-icon>
              </v-col>
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
          exact
          v-else
          :key="JSON.stringify(item)"
          :to="{ path: '/watch' + item.hyperlink.href, query: { root: item.hyperlink.root } }"
        >
          <v-container>
            <v-row justify="center">
              <v-col class="flex-shrink-1 flex-grow-0">
                <v-icon :style="{fontSize: '5rem'}">mdi-play-circle</v-icon>
              </v-col>
            </v-row>
          </v-container>
          <v-card-title>
            <div class="text-truncate">{{item.name}}</div>
          </v-card-title>
          <v-card-subtitle>
            <div class="text-truncate">{{item.src}}</div>
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <v-list v-else>
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