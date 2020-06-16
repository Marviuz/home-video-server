<template>
  <v-container>
    <v-list>
      <template v-for="(anime, i) in animes">
        <v-list-item
          exact
          v-if="anime.isDir"
          :key="`${JSON.stringify(anime)}-${i}`"
          :to="{ name: 'Animes', query: { dir: anime.name, root: anime.src } }"
        >
          <v-list-item-icon>
            <v-icon>mdi-folder</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{anime.name}}</v-list-item-title>
            <v-list-item-subtitle>{{anime.src}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          exact
          v-else
          :key="`${JSON.stringify(anime)}-${i}`"
          :to="{ name: 'Watch', query: { src: `${anime.src}\\${anime.name}`, root: anime.src } }"
        >
          <v-list-item-icon>
            <v-icon>mdi-play-circle</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{anime.name}}</v-list-item-title>
            <v-list-item-subtitle>{{anime.src}}</v-list-item-subtitle>
          </v-list-item-content>
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