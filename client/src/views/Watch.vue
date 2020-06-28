<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <app-video
            @wheel.native.prevent="onScroll"
            @ended="playNext"
            @skip-forward="playNext"
            @skip-backward="playPrevious"
            :src="src"
            ref="vid"
          ></app-video>
          <v-card-text>
            <v-card-title>{{$route.params.path.split(/[\/\\]/g).pop().replace(/.[\w]+$/, '')}}</v-card-title>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-toolbar flat>
            <v-btn
              icon
              large
              :to="{ path: '/' + $route.path.split('/').slice(2, -1).join('/'), query: { root: $route.query.root } }"
            >
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
          <v-card-text>
            <v-row v-if="display === 0">
              <v-col cols="6" v-for="item in items" :key="JSON.stringify(item)">
                <v-card
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
                  exact
                  v-else
                  :key="JSON.stringify(item)"
                  :to="{ path: '/watch' + item.hyperlink.href, query: { root: item.hyperlink.root } }"
                  exact-active-class="blue"
                >
                  <v-container>
                    <v-row justify="center">
                      <v-avatar :size="100">
                        <v-icon
                          :size="100"
                        >{{ $route.params.path.split(/[\/\\]/g).pop() === item.name ? 'mdi-play-circle' : 'mdi-filmstrip' }}</v-icon>
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
              </v-col>
            </v-row>

            <v-list v-else>
              <template v-for="item in items">
                <v-list-item
                  exact
                  v-if="!item.isDir"
                  :key="JSON.stringify(item)"
                  :to="{ path: '/watch' + item.hyperlink.href, query: { root: item.hyperlink.root } }"
                >
                  <v-list-item-avatar>
                    <v-icon
                      :size="40"
                    >{{ $route.params.path.split(/[\/\\]/g).pop() === item.name ? 'mdi-play-circle' : 'mdi-filmstrip' }}</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{item.name}}</v-list-item-title>
                    <v-list-item-subtitle>{{item.src}}\{{item.name}}</v-list-item-subtitle>
                    <v-list-item-subtitle
                      class="green--text"
                      v-if="$route.params.path.split(/[\/\\]/g).pop() === item.name"
                    >
                      <v-icon>mdi-circle-medium</v-icon>
                      <em>Currently Playing</em>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item
                  exact
                  v-else
                  :key="JSON.stringify(item)"
                  :to="{ path: item.hyperlink.href, query: { root: item.hyperlink.root } }"
                >
                  <v-list-item-avatar>
                    <v-icon :size="40">mdi-folder</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{item.name}}</v-list-item-title>
                    <v-list-item-subtitle>{{item.src}}/{{item.name}}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import qs from "query-string";
import config from "@/config";
import { getItem } from "@/services/axios";
import AppVideo from "@/components/AppVideo";

export default {
  components: {
    AppVideo
  },
  data() {
    const ls = localStorage.getItem("display");

    return {
      config,
      items: [],

      displayValue: ls ? parseInt(ls, 10) : 0
    };
  },
  computed: {
    src() {
      const { query, params } = this.$route;

      return qs.stringifyUrl({
        url: `http://${config.ip}:8081/api-stream/${params.path}`,
        query: { root: query.root }
      });
    },
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
  mounted() {
    // this.$refs.vid.focus(); // Apply focus to vid to apply hotkeys immediately.
    window.addEventListener("keydown", this.handleHotkeys);
  },
  created() {
    this.getSiblings();
  },
  watch: {
    $route(to, from) {}
  },
  methods: {
    onScroll(evt) {
      const delta = Math.max(-1, Math.min(1, evt.wheelDelta || -evt.detail));

      try {
        this.$refs.vid.volume += 0.05 * delta;
      } catch (err) {
        /* Empty catch */
      }
    },
    handleHotkeys(evt) {
      const key = evt.key.toLowerCase();

      switch (key) {
        case "n":
        case "mediatracknext":
          evt.preventDefault();
          this.playNext();
          break;
        // Previous
        case "p":
        case "mediatrackprevious":
          evt.preventDefault();
          this.playPrevious();
          break;
      }
    },
    playNext(evt) {
      const { query, params } = this.$route;

      const playables = this.items.filter((item, i) => !item.isDir).length;

      if (playables === 1) {
        // Only 1 item in playlist
        this.$refs.vid.player.currentTime(0);
        return this.$refs.vid.player.load();
      }

      const nextPlayingIndex =
        this.items.findIndex(
          _ => _.name === params.path.split(/[\/\\]/g).pop()
        ) + 1;

      let item = this.items[nextPlayingIndex];

      if (item) {
        this.$router.push({
          path: "/watch" + item.hyperlink.href,
          query: {
            root: item.hyperlink.root
          }
        });
      } else {
        for (const _ of this.items) {
          if (!_.isDir) {
            return this.$router.push({
              path: "/watch" + _.hyperlink.href,
              query: {
                root: _.hyperlink.root
              }
            });
          }
        }
      }
    },
    playPrevious() {
      const { query, params } = this.$route;

      const playables = this.items.filter((item, i) => !item.isDir).length;

      if (playables === 1) {
        // Only 1 item in playlist
        this.$refs.vid.player.currentTime(0);
        return this.$refs.vid.player.play();
      }

      const playingIndex = this.items.findIndex(
        _ => _.name === params.path.split(/[\/\\]/g).pop()
      );

      let nextPlayingIndex;
      for (let i = playingIndex; this.items[i - 1] && i > -1; i--) {
        if (!this.items[i - 1].isDir) {
          nextPlayingIndex = i - 1;
          break;
        }
        if (i > 0) i = this.items.length + 1;
      }

      let item = this.items[nextPlayingIndex];

      if (item) {
        this.$router.push({
          path: "/watch" + item.hyperlink.href,
          query: {
            root: item.hyperlink.root
          }
        });
      } else {
        const items = [...this.items].reverse(); // Reverse order of items

        for (const _ of items) {
          if (!_.isDir) {
            return this.$router.push({
              path: "/watch" + _.hyperlink.href,
              query: {
                root: _.hyperlink.root
              }
            });
          }
        }
      }
    },
    getSiblings() {
      const path = ["", ...this.$route.params.path.split(/[\\/]/)];
      path.pop();

      getItem(path.join("/"), { root: this.$route.query.root }).then(
        _ => (this.items = _.data)
      );
    }
  }
};
</script>