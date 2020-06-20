<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <app-video
            ref="vid"
            @keyup.native="handleHotkeys"
            @wheel.native.prevent="onScroll"
            @ended="playNext"
            @skip-forward="playNext"
            @skip-backward="playPrevious"
            :replay-on-end="replayOnEnd"
            :src="src"
          ></app-video>
          <v-card-text>
            <v-card-title>{{$route.params.path.split(/[\/\\]/g).pop()}}</v-card-title>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-list>
          <template v-for="item in items">
            <v-list-item
              exact
              v-if="!item.isDir"
              :key="JSON.stringify(item)"
              :to="{ path: '/watch' + item.hyperlink.href, query: { root: item.hyperlink.root } }"
            >
              <v-list-item-icon>
                <v-icon>{{ $route.params.path.split(/[\/\\]/g).pop() === item.name ? 'mdi-play-circle' : 'mdi-filmstrip' }}</v-icon>
              </v-list-item-icon>
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
              <v-list-item-icon>
                <v-icon>mdi-folder</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{item.name}}</v-list-item-title>
                <v-list-item-subtitle>{{item.src}}/{{item.name}}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import qs from "query-string";
import config from "@/config";
import { getItem } from "@/services/axios";
import { jsonify } from "@/utils/jsonify";
import AppVideo from "@/components/AppVideo";

export default {
  components: {
    AppVideo
  },
  data() {
    return {
      config,
      items: [],
      replayOnEnd: false
    };
  },
  computed: {
    src() {
      const { query, params } = this.$route;

      return qs.stringifyUrl({
        url: `http://${config.ip}:8081/api-stream/${params.path}`,
        query: { root: query.root }
      });
    }
  },
  mounted() {
    // this.$refs.vid.focus(); // Apply focus to vid to apply hotkeys immediately.
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
      const key = event.key.toLowerCase();

      switch (key) {
        // Fullscreen
        case "f":
          if (document.fullscreenElement) document.exitFullscreen();
          else evt.target.requestFullscreen();
          break;
        // Mute
        case "m":
          if (this.$refs.vid.volume) {
            localStorage.setItem("volume", this.$refs.vid.volume);
            this.$refs.vid.volume = 0;
          } else this.$refs.vid.volume = localStorage.getItem("volume");
          break;
        // Next
        case "n":
          this.playNext();
          break;
        // Previous
        case "p":
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
        return this.$refs.player.play();
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