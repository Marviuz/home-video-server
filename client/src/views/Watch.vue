<template>
  <v-container>
    <video controls autoplay :src="src" :style="{ width: '100%' }"></video>
  </v-container>
</template>

<script>
import qs from "query-string";
import config from "@/config";

export default {
  data() {
    return {
      src: `http://${config.ip}:8081/api/video?${qs.stringify({
        src: this.$route.query.src
      })}`
    };
  }
};
</script>