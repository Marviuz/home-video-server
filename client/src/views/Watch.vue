<template>
  <v-container>
    <video
      :key="src"
      @wheel.prevent="onScroll"
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

    <v-list>
      <template v-for="ep in eps">
        <v-list-item
          exact
          v-if="!ep.isDir"
          :key="JSON.stringify(ep)"
          :to="{ name: 'Watch', query: { src: `${ep.src}\\${ep.name}`, root: $route.query.root } }"
        >
          <v-list-item-icon>
            <v-icon>mdi-play</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ep.name}}</v-list-item-title>
            <v-list-item-subtitle>{{ep.src}}\{{ep.name}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
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
    queryString(_) {
      return qs.stringify(_);
    }
  }
};
</script>