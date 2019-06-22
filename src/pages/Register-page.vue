<template>
    <div>
        <form id="registerSection" v-if="!searching && !playerFound && !showConnectionError"  v-on:submit.prevent>
            <h1>Please enter a username</h1>
            <input type="text" id="name" v-model="name">
            <br>
            <button @click="searchForGame()">Search for game</button>
        </form>
        <div id="searchingLoader" v-if="searching">Searching for a game....</div>
        <div id="playerFound" v-if="playerFound">You have matched with {{ opponent.name }}</div>
        <div id="connectionError" v-if="showConnectionError" style="color: red">We ran into a problem connecting you to a match</div>

    </div>
</template>

<script>
import io from 'socket.io-client';


export default {
  name: 'Register-page',
  components: {
    
  },
  data() {
    return {
      socket: '',  
      searching: false,
      name: '',
      playerFound: false,
      opponent: '',
      showConnectionError: false
    }
  },
  methods: {
    searchForGame() {
            this.socket = io('http://localhost:3500', {
                 reconnection: false
            });


            this.socket.on("connect_error", () => {
                this.showConnectionError = true;
            })

            this.socket.on("connect", () => {
                this.socket.on("opponent-found", (opponent) => {
                this.searching = false;
                this.opponent = opponent
                this.playerFound = true;
                this.socket.disconnect();
                const nameSpaceSocket = io('http://localhost:3500' + opponent.nameSpace);

                nameSpaceSocket.on("welcome", (data) => {
                    alert("weclome to namespace " + data)
                })

                nameSpaceSocket.on("user-left", () => {
                    alert("USER HAS DISCONNECTED")
                })
                })
                this.socket.emit("game-searching", this.name);
                this.searching = true;
            })

            


   
    }
  }
}
</script>

<style>

</style>
