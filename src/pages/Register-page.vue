<template>
    <div>
        <form id="registerSection" v-if="!searching && !playerFound" v-on:submit.prevent>
            <h1>Please enter a username</h1>
            <input type="text" id="name" v-model="name">
            <br>
            <button @click="searchForGame()">Search for game</button>
        </form>
        <div id="searchingLoader" v-if="searching">Searching for a game....</div>
        <div id="playerFound" v-if="playerFound">You have matched with {{ opponent }}</div>
    </div>
</template>

<script>
import socket from '../socket';

export default {
  name: 'Register-page',
  components: {
    
  },
  data() {
    return {
      searching: false,
      name: '',
      playerFound: false,
      opponent: ''
    }
  },
  mounted() {
    socket.on("opponent-found", (opponent) => {
      this.searching = false;
      this.opponent = opponent
      this.playerFound = true;
    })

  },
  methods: {
    searchForGame() {
      socket.emit("game-searching", this.name);
      this.searching = true;
    }
  }
}
</script>

<style>

</style>
