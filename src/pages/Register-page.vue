<template>
    <main>
        <v-alert
        :value="showUserLeftAlert"
        type="warning"
        transition="scale-transition"
        :dismissible=true
      > {{ latestOpponent.name}} has left the match</v-alert>

      <Test />
      <p v-if="!showConnectionError">Currently {{ usersOnline }} players online</p>
        <form id="registerSection" v-if="!searching && !playerFound && !showConnectionError"  v-on:submit.prevent>
            <h1>Please enter a username</h1>
            <input type="text" id="name" v-model="name">
            <br>
            <v-btn @click="searchForGame()" color="danger">Search for game</v-btn>
        </form>
        <div id="searchingLoader" v-if="searching">Searching for a game....</div>
        <div class="spinner" v-if="searching">
          <div class="cube1"></div>
          <div class="cube2"></div>
        </div>    
        <div id="connectionError" v-if="showConnectionError" style="color: red">We ran into a problem connecting you with the servers</div>

    </main>
</template>

<script>
import io from 'socket.io-client';
import { mapState } from 'vuex'



export default {
  name: 'Register-page',
  data() {
    return {
      searching: false,
      name: '',
      playerFound: false,
      latestOpponent: '',
      showConnectionError: false,
      showUserLeftAlert: false
    }
  },
  computed: mapState(['socket', 'nspSocket', 'usersOnline']),
  async mounted() {
          this.latestOpponent = this.$store.state.opponent;
          this.showUserLeftAlert = this.$store.state.showUserLeftMatchAlert;
          let socketConnection = await io(process.env.VUE_APP_SERVER_URL, {
                 reconnection: false,
          });
          this.$store.commit("updateSocket", socketConnection);

          this.socket.on("connect_error", () => {
                this.showConnectionError = true;
            })

          this.socket.on("users-online", (users) => {
              this.$store.commit("updateUsersOnline", users);
          })
  },
  methods: {
    searchForGame() {
                this.socket.on("opponent-found", (opponent) => {
                this.$store.commit("updateShowUserLeftMatchAlert", false)
                this.searching = false;
                this.playerFound = true;
                this.$router.push({
                    name: "game",
                    params: {
                        namespace: opponent.nameSpace,
                        name: this.name
                    }
                })
            })
                
            this.socket.emit("game-searching", this.name);
            this.searching = true;

            


   
    }
  }
}
</script>

<style >

.spinner {
  margin: 100px auto;
  width: 40px;
  height: 40px;
  position: relative;
}

.cube1, .cube2 {
  background-color: white;
  width: 15px;
  height: 15px;
  position: absolute;
  top: 0;
  left: 0;
  
  -webkit-animation: sk-cubemove 1.8s infinite ease-in-out;
  animation: sk-cubemove 1.8s infinite ease-in-out;
}

.cube2 {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}

@-webkit-keyframes sk-cubemove {
  25% { -webkit-transform: translateX(42px) rotate(-90deg) scale(0.5) }
  50% { -webkit-transform: translateX(42px) translateY(42px) rotate(-180deg) }
  75% { -webkit-transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5) }
  100% { -webkit-transform: rotate(-360deg) }
}

@keyframes sk-cubemove {
  25% { 
    transform: translateX(42px) rotate(-90deg) scale(0.5);
    -webkit-transform: translateX(42px) rotate(-90deg) scale(0.5);
  } 50% { 
    transform: translateX(42px) translateY(42px) rotate(-179deg);
    -webkit-transform: translateX(42px) translateY(42px) rotate(-179deg);
  } 50.1% { 
    transform: translateX(42px) translateY(42px) rotate(-180deg);
    -webkit-transform: translateX(42px) translateY(42px) rotate(-180deg);
  } 75% { 
    transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5);
    -webkit-transform: translateX(0px) translateY(42px) rotate(-270deg) scale(0.5);
  } 100% { 
    transform: rotate(-360deg);
    -webkit-transform: rotate(-360deg);
  }
}

main {
  height: 100vh;
  background-color: blueviolet
}

</style>
