<template>
  <div
    class="app-player-container"
    ref="playerContainer"
    @keyup="evt => $emit('keyup', evt)"
    @mousemove="handleCursorInPlayer"
  >
    <video
      ref="videoPlayer"
      @wheel="$emit('wheel', evt)"
      @ended="evt => $emit('ended', evt)"
      class="video-js"
    ></video>
    <div class="app-player-overlay" ref="overlay">
      <div class="app-player__overlay" @dblclick="handleFullScreen" @click="playOrPause">
        <span
          :class="{'app-player__time-text': true, 'flow-text': true, 'pa-5': !isMobile, 'pa-3': isMobile}"
        >{{secondsToTime(localData.currentTime)}}</span>
      </div>
      <div class="app-player-controls">
        <v-slider
          class="px-2"
          :label="secondsToTime(localData.duration)"
          inverse-label
          @start="startSeek"
          @end="endSeek"
          @change="val => this.player.currentTime(val)"
          :max="localData.duration"
          :step=".1"
          v-model="localData.currentTime"
          hide-details
        ></v-slider>
        <v-container fluid class="pt-0">
          <v-row no-gutters align="center" class="flex-nowrap">
            <v-col class="flex-shrink-1 flex-grow-0 pr-3">
              <v-btn small fab @click="playOrPause">
                <v-icon>{{player && player.paused() ? 'mdi-play' : 'mdi-pause'}}</v-icon>
              </v-btn>
            </v-col>
            <v-col class="flex-shrink-1 flex-grow-0 px-3">
              <v-btn x-small @click="evt => $emit('skip-backward', evt)" fab depressed>
                <v-icon>mdi-skip-backward</v-icon>
              </v-btn>
            </v-col>
            <v-col class="flex-shrink-1 flex-grow-0 px-3">
              <v-btn x-small @click="evt => $emit('skip-forward', evt)" fab>
                <v-icon>mdi-skip-forward</v-icon>
              </v-btn>
            </v-col>
            <v-spacer></v-spacer>
            <template v-if="!isMobile">
              <v-col cols="2">
                <v-slider
                  :label="(volume * 100).toFixed()"
                  :step=".01"
                  :min="0"
                  :max="1"
                  v-model="volume"
                  hide-details
                  reverse
                  :append-icon="volume > .5 ? 'mdi-volume-high' : volume > 0 ? 'mdi-volume-medium' : 'mdi-volume-mute'"
                  @click:append="handleVolumeIcon"
                ></v-slider>
              </v-col>
            </template>
            <v-col class="flex-shrink-1 flex-grow-0 px-3" v-else>
              <v-btn x-small @click="handleFullScreen" fab>
                <v-icon>mdi-fullscreen</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { isMobile } from "@/utils";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default {
  name: "AppVideo",
  props: {
    src: {
      type: String,
      default: "//:0"
    },
    replayOnEnd: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const volumeValue = localStorage.getItem("volume")
      ? parseFloat(localStorage.getItem("volume"))
      : 1;

    return {
      isMobile,
      mediaEvents: ["play", "pause", "timeupdate", "seeked"],

      mouseInPlayerTimeout: null,
      isPausedBefore: false,
      volumeValue,

      localData: {
        currentTime: 0,
        duration: 0
      },

      player: null,
      options: {
        autoplay: true,
        controls: false,
        fluid: true,
        alwaysCaptureHotkeys: true,
        sources: []
      }
    };
  },
  computed: {
    volume: {
      get() {
        return this.volumeValue;
      },
      set(val) {
        this.volumeValue = val;
        localStorage.setItem("volume", val);

        if (this.player) this.player.volume(val);
      }
    }
  },
  mounted() {
    // Setup source
    this.options.sources[0] = { src: this.src };
    const _this = this;

    this.player = videojs(
      this.$refs.videoPlayer,
      this.options,
      function onPlayerReady() {
        this.volume(parseFloat(localStorage.getItem("volume")));
      }
    );

    // Setup media events
    this.mediaEvents.forEach(event =>
      this.player.on(event, () => {
        if (!(this.player.paused() && event === "timeupdate")) {
          this.localData = {
            ...this.localData,
            currentTime: this.player.currentTime(),
            duration: this.player.duration(),
            isPlaying: !this.player.paused()
          };
        }
      })
    );
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
  watch: {
    $route(to, from) {
      this.player.src({ src: this.src });
    },
    "localData.currentTime"(val) {
      if (this.player.paused()) {
        this.player.currentTime(val);
      }
    }
  },
  methods: {
    playOrPause() {
      if (!this.player.paused()) {
        this.player.pause();
      } else {
        this.player.play();
      }
    },
    startSeek(val) {
      this.isPausedBefore = this.player.paused();
      this.player.pause();
    },
    endSeek(val) {
      this.player.currentTime(val);
      if (!this.isPausedBefore) this.player.play();
    },
    handleCursorInPlayer(evt) {
      this.$refs.overlay.classList.add("active");

      clearTimeout(this.mouseInPlayerTimeout);

      this.mouseInPlayerTimeout = setTimeout(() => {
        if (this.player) {
          try {
            if (!this.player.paused()) {
              this.$refs.overlay.classList.remove("active");
            }
          } catch (err) {
            /* Empty */
          }
        }
      }, 2000);
    },
    handleVolumeIcon(evt) {
      if (this.volume) {
        localStorage.setItem("tempVolume", this.volume);
        this.volume = 0;
      } else {
        this.volume = parseFloat(localStorage.getItem("tempVolume")) || 0.01;
        localStorage.removeItem("tempVolume");
      }
    },
    handleFullScreen(evt) {
      if (evt.type === "dblclick" && isMobile) return;

      if (!document.fullscreenElement) {
        this.$refs.playerContainer.requestFullscreen();

        if (isMobile) return screen.orientation.lock("landscape");
        else return;
      }

      return document.exitFullscreen();
    },
    convertToReadable(_) {
      return videojs.formatTime();
    },
    secondsToTime(seconds) {
      return moment
        .utc(moment.duration(seconds, "seconds").asMilliseconds())
        .format(seconds < 3600 ? "mm:ss" : "HH:mm:ss");
    }
  }
};
</script>

<style>
.video-js,
.video-js * {
  outline: none !important;
  pointer-events: none;
}
</style>

<style scoped>
.video-js {
  position: initial;
}

* {
  user-select: none !important;
}

.app-player-container {
  position: relative;
  width: 100%;
}

.app-player-overlay {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  opacity: 0;
  transition: 0.3s ease;
  cursor: none;
}

.app-player-overlay.active {
  opacity: 1;
  cursor: default;
}

.app-player__overlay {
  flex-grow: 1;
  flex-shrink: 0;
}

.app-player__time-text {
  font-size: 300%;
  margin-left: 15px;
  pointer-events: none;
  position: absolute;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.app-player-controls {
  flex-grow: 0;
  flex-shrink: 1;
  width: 100%;
  background: linear-gradient(to top, black, transparent);
  height: 85px;
}
</style>

<style scoped>
/* From Materialize v1.0.0 (http://materializecss.com) */
@media only screen and (min-width: 360px) {
  .flow-text {
    font-size: 1.2rem;
  }
}

@media only screen and (min-width: 390px) {
  .flow-text {
    font-size: 1.224rem;
  }
}

@media only screen and (min-width: 420px) {
  .flow-text {
    font-size: 1.248rem;
  }
}

@media only screen and (min-width: 450px) {
  .flow-text {
    font-size: 1.272rem;
  }
}

@media only screen and (min-width: 480px) {
  .flow-text {
    font-size: 1.296rem;
  }
}

@media only screen and (min-width: 510px) {
  .flow-text {
    font-size: 1.32rem;
  }
}

@media only screen and (min-width: 540px) {
  .flow-text {
    font-size: 1.344rem;
  }
}

@media only screen and (min-width: 570px) {
  .flow-text {
    font-size: 1.368rem;
  }
}

@media only screen and (min-width: 600px) {
  .flow-text {
    font-size: 1.392rem;
  }
}

@media only screen and (min-width: 630px) {
  .flow-text {
    font-size: 1.416rem;
  }
}

@media only screen and (min-width: 660px) {
  .flow-text {
    font-size: 1.44rem;
  }
}

@media only screen and (min-width: 690px) {
  .flow-text {
    font-size: 1.464rem;
  }
}

@media only screen and (min-width: 720px) {
  .flow-text {
    font-size: 1.488rem;
  }
}

@media only screen and (min-width: 750px) {
  .flow-text {
    font-size: 1.512rem;
  }
}

@media only screen and (min-width: 780px) {
  .flow-text {
    font-size: 1.536rem;
  }
}

@media only screen and (min-width: 810px) {
  .flow-text {
    font-size: 1.56rem;
  }
}

@media only screen and (min-width: 840px) {
  .flow-text {
    font-size: 1.584rem;
  }
}

@media only screen and (min-width: 870px) {
  .flow-text {
    font-size: 1.608rem;
  }
}

@media only screen and (min-width: 900px) {
  .flow-text {
    font-size: 1.632rem;
  }
}

@media only screen and (min-width: 930px) {
  .flow-text {
    font-size: 1.656rem;
  }
}

@media only screen and (min-width: 960px) {
  .flow-text {
    font-size: 1.68rem;
  }
}

@media only screen and (max-width: 360px) {
  .flow-text {
    font-size: 1.2rem;
  }
}
</style>