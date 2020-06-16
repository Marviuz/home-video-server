<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="8">
        <video
          @wheel.prevent="onScroll"
          @keyup="handleHotkeys"
          @ended="playNext"
          :src="`http://${config.ip}:8081/api/video?${queryString({src})}`"
          :style="{ outline: 'none', width: '100%' }"
          controls
          autoplay
          ref="vid"
        ></video>
        <v-card>
          <v-card-text>
            <v-card-title>{{$route.query.src.split(/[\/\\]/g).pop()}}</v-card-title>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-list>
          <template v-for="ep in eps">
            <v-list-item
              exact
              v-if="!ep.isDir"
              :key="JSON.stringify(ep)"
              :to="{ name: 'Watch', query: { src: `${ep.src}\\${ep.name}`, root: $route.query.root } }"
            >
              <v-list-item-icon>
                <v-icon>{{ $route.query.src.split(/[\/\\]/g).pop() === ep.name ? 'mdi-play-circle' : 'mdi-filmstrip' }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ep.name}}</v-list-item-title>
                <v-list-item-subtitle>{{ep.src}}\{{ep.name}}</v-list-item-subtitle>
                <v-list-item-subtitle
                  class="green--text"
                  v-if="$route.query.src.split(/[\/\\]/g).pop() === ep.name"
                >
                  <v-icon>mdi-circle-medium</v-icon>
                  <em>Currently Playing</em>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              exact
              v-else
              :key="JSON.stringify(ep)"
              :to="{ name: 'Animes', query: { dir: ep.name, root: $route.query.root } }"
            >
              <v-list-item-icon>
                <v-icon>mdi-folder</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ep.name}}</v-list-item-title>
                <v-list-item-subtitle>{{ep.src}}/{{ep.name}}</v-list-item-subtitle>
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
import axios from "@/services/axios";
import { jsonify } from "@/utils/jsonify";

export default {
  data() {
    return {
      src: this.$route.query.src,
      config,
      eps: []
    };
  },
  mounted() {
    this.$refs.vid.focus(); // Apply focus to vid to apply hotkeys immediately.
  },
  created() {
    const root = this.$route.query.root.split(/[\/\\]/g);
    const dir = root.pop();

    axios
      .get("/anime", {
        params: {
          dir,
          root: root.join("/")
        }
      })
      .then(_ => (this.eps = _.data));
  },
  watch: {
    $route(to, from) {
      this.src = this.$route.query.src;
    }
  },
  methods: {
    onScroll(evt) {
      const delta = Math.max(-1, Math.min(1, evt.wheelDelta || -evt.detail));

      try {
        this.$refs.vid.volume += 0.1 * delta;
      } catch (err) {}
    },
    handleHotkeys(evt) {
      const key = event.key.toLowerCase();

      switch (key) {
        // Fullscreen
        case "f":
          if (document.fullscreenElement) document.exitFullscreen();
          else this.$refs.vid.requestFullscreen();
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
    playNext() {
      const playables = this.eps.filter((ep, i) => !ep.isDir).length;

      if (playables === 1) {
        this.$refs.vid.currentTime = 0;
        return this.$refs.vid.play();
      }

      const nextPlayingIndex =
        this.eps.findIndex(
          _ => _.name === this.$route.query.src.split(/[\/\\]/g).pop()
        ) + 1;

      let ep = this.eps[nextPlayingIndex];

      if (ep) {
        this.$router.push({
          name: "Watch",
          query: { src: `${ep.src}\\${ep.name}`, root: this.$route.query.root }
        });
      } else {
        for (const _ of this.eps) {
          if (!_.isDir) {
            return this.$router.push({
              name: "Watch",
              query: {
                src: `${_.src}\\${_.name}`,
                root: this.$route.query.root
              }
            });
          }
        }
      }
    },
    playPrevious() {
      const playables = this.eps.filter((ep, i) => !ep.isDir).length;

      if (playables === 1) {
        this.$refs.vid.currentTime = 0;
        return this.$refs.vid.play();
      }

      const playingIndex = this.eps.findIndex(
        _ => _.name === this.$route.query.src.split(/[\/\\]/g).pop()
      );

      let nextPlayingIndex;
      for (let i = playingIndex; this.eps[i - 1] && i > -1; i--) {
        if (!this.eps[i - 1].isDir) {
          nextPlayingIndex = i - 1;
          break;
        }
        if (i > 0) i = this.eps.length + 1;
      }

      let ep = this.eps[nextPlayingIndex];

      if (ep) {
        this.$router.push({
          name: "Watch",
          query: { src: `${ep.src}\\${ep.name}`, root: this.$route.query.root }
        });
      } else {
        const eps = [...this.eps].reverse(); // Reverse order of episodes

        for (const _ of eps) {
          if (!_.isDir) {
            return this.$router.push({
              name: "Watch",
              query: {
                src: `${_.src}\\${_.name}`,
                root: this.$route.query.root
              }
            });
          }
        }
      }
    },
    queryString(_) {
      return qs.stringify(_);
    }
  }
};
</script>