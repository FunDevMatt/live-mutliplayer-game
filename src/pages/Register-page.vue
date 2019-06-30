<template>
  <div>
      <v-alert
      :value="showMissingNickName"
      :dismissible="true"
      type="warning"
      color="#FF6584"
      @input="resetMissingNickname()"
    >
    Make sure you have entered in a nickname!
     </v-alert>
      <div class="content">
      <div id="weclomeSection">
        <h1 id="mainMessage">Share your story.</h1>
        <p class="subHeading" id="knowlegdeSub">
          Your knowlegde is valuable. Meet with like-minded individuals and discuss anything development related.
        </p>
        <div id="computerIllustration"></div>
      </div>
      <div id="searchSection">
          <div id="searchContent">
            <p class="subHeading t-center">Just enter in a nickname.</p>
            <v-text-field
            label="Nickname"
            v-model="name"
            style="max-width: 17rem; margin: 0 auto"
          ></v-text-field>
           <p class="subHeading t-center">And</p>
            <v-btn :loading="searching" @click="searchForGame()" color="#FF6584" style="color: white; left: 50%; transform: translateX(-55%)">Meet A Dev!</v-btn>
            <transition name="fade">
                          <p class="t-center" v-if="searching">Searching for a dev!</p>

            </transition>
            <p class="t-center" id="devCount">There is currently {{ usersOnline }} 
              <span v-if="usersOnline === 1">dev</span> 
              <span v-if="usersOnline !== 1">devs</span>
              online.</p>
          </div>
      </div>
  </div>

  </div>

  <!-- <main>
    <v-alert
      :value="showUserLeftAlert"
      type="warning"
      transition="scale-transition"
      :dismissible="true"
    >{{ latestOpponent.name}} has left the match</v-alert>

    <p v-if="!showConnectionError">Currently {{ usersOnline }} players online</p>
    <form
      id="registerSection"
      v-if="!searching && !playerFound && !showConnectionError"
      v-on:submit.prevent
    >
      <h1>Please enter a username</h1>
      <input type="text" id="name" v-model="name">
      <br>
      <v-btn @click="searchForGame()" color="danger">Search for game</v-btn>
      <p v-if="!webcamAllowed">Enable your webcam to start!</p>
    </form>
    <div id="searchingLoader" v-if="searching">Searching for a game....</div>
    <div class="spinner" v-if="searching">
      <div class="cube1"></div>
      <div class="cube2"></div>
    </div>
    <div
      id="connectionError"
      v-if="showConnectionError"
      style="color: red"
    >We ran into a problem connecting you with the servers</div>
  </main> -->
</template>

<script>
import io from "socket.io-client";
import { mapState } from "vuex";

export default {
  name: "Register-page",
  data() {
    return {
      searching: false,
      name: "",
      playerFound: false,
      latestOpponent: "",
      showConnectionError: false,
      showUserLeftAlert: false,
      webcamAllowed: false,
      webcamStream: null,
      showMissingNickName: false
    };
  },
  computed: mapState(["socket", "nspSocket", "usersOnline"]),
  async mounted() {

    this.webcamStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    if (this.webcamStream) {
      this.webcamAllowed = true;
    }

    this.latestOpponent = this.$store.state.opponent;
    this.showUserLeftAlert = this.$store.state.showUserLeftMatchAlert;
    let socketConnection = await io(process.env.VUE_APP_SERVER_URL, {
      reconnection: false
    });
    this.$store.commit("updateSocket", socketConnection);

    this.socket.on("connect_error", () => {
      this.showConnectionError = true;
    });

    this.socket.on("users-online", users => {
      this.$store.commit("updateUsersOnline", users);
    });
  },
  beforeDestroy() {
    if (this.webcamStream) {
      let tracks = this.webcamStream.getTracks();
      tracks.forEach(function(track) {
        track.stop();
      });
    }
  },
  methods: {
    searchForGame() {
      if (this.name === '') {
        this.showMissingNickName = true;
        return;

      }
      this.socket.on("opponent-found", opponent => {
        this.$store.commit("updateShowUserLeftMatchAlert", false);
        this.searching = false;
        this.playerFound = true;
        this.$router.push({
          name: "game",
          params: {
            namespace: opponent.nameSpace,
            name: this.name
          }
        });
      });

      this.socket.emit("game-searching", this.name);
      this.searching = true;
    },
    resetMissingNickname() {
      this.showMissingNickName = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.t-center {
  text-align: center;
}
  .content {
    text-align: left;
    min-height: 100vh;
    background-color: #3EADFF;
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    


    & > div {
      padding: 0 4rem;
    }

    #mainMessage {
      margin-top: 5.5rem;
      font-size: 5rem;
      line-height: 5.5rem;
    }

    .subHeading {
      font-size: 1.6rem;
      line-height: 3rem;
    }

    #knowlegdeSub {
      margin-top: 2rem;
    }

    #computerIllustration {
      width: 100%;
      height: 21rem;
      background-image: url("../assets/img/cropped-desk.png");
      background-size: 100% 100%;
      background-repeat: no-repeat;
      margin-top: .5rem;
      max-width: 40rem;
      min-width: 21rem;
    }

    #searchSection {
      position: relative;

      #searchContent {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    #devCount {
      margin-top: 2rem;
    }
  }
  

  @media screen and (max-width: 850px) {
    .content {
      grid-template-columns: 1fr;
        & > div {
      padding: 0 1rem;
    }
    }
    #searchContent {
        position: relative !important;
        top: 0;
        left: 0;
        transform: translate(0, 0);
      }

      #mainMessage {
        margin-top: 2rem !important;
      }

    #computerIllustration {
      margin-left: auto;
      margin-right: auto;
    }

  
    
  }
  


</style>
