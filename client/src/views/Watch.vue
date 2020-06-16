<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8">
        <video
          @wheel.prevent="onScroll"
          @keyup="handleHotkeys"
          :key="src"
          controls
          autoplay
          :src="`http://${config.ip}:8081/api/video?${queryString({src})}`"
          :style="{ outline: 'none', width: '100%' }"
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
                <v-list-item-subtitle>
                  <template v-if="$route.query.src.split(/[\/\\]/g).pop() === ep.name">
                    <v-icon>mdi-circle-medium</v-icon>
                    <em>Currently Playing</em>
                  </template>
                  <span v-else>{{ep.src}}\{{ep.name}}</span>
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

export default {
  data() {
    return {
      src: this.$route.query.src,
      config,
      eps: []
    };
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
        case "f":
          if (document.fullscreenElement) document.exitFullscreen();
          else this.$refs.vid.requestFullscreen();
          break;
        case "m":
          if (this.$refs.vid.volume) {
            localStorage.setItem("volume", this.$refs.vid.volume);
            this.$refs.vid.volume = 0;
          } else this.$refs.vid.volume = localStorage.getItem("volume");
          break;
      }
    },
    queryString(_) {
      return qs.stringify(_);
    }
  }
};
</script>