<template>
  <v-container>
    <v-list>
      <template v-for="(anime, i) in animes">
        <v-list-item
          v-if="anime.isDir"
          :key="`${JSON.stringify(anime)}-${i}`"
          :to="{ name: 'Animes', query: { dir: anime.name, root: anime.src } }"
        >
          <v-list-item-title>{{anime.name}} {{anime.src}}</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-else
          :key="`${JSON.stringify(anime)}-${i}`"
          :to="{ name: 'Watch', query: { src: `${anime.src}\\${anime.name}`, root: anime.src } }"
        >
          <v-list-item-title>{{anime.name}}</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-container>
</template>

<script>
import axios from "@/services/axios";

export default {
  data() {
    return {
      animes: []
    };
  },
  created() {
    this.getAnime(this.$route.query.dir, this.$route.query.root);
  },
  watch: {
    $route(to, from) {
      this.getAnime(this.$route.query.dir, this.$route.query.root);
    }
  },
  methods: {
    getAnime(anime, root) {
      if (!anime) {
        return axios.get("/animes").then(_ => {
          this.animes = _.data;
          // setTimeout(this.getAnimes, 1000);
        });
      }

      axios
        .get("/anime", {
          params: {
            dir: anime,
            root
          }
        })
        .then(_ => (this.animes = _.data));
    }
  }
};
</script>