<template>
  <div id="app">
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
import socket from './socket';

export default {
  name: 'app',
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
      this.opponent = opponent.name;
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
* {
  text-align: center;
  padding: 0;
  margin: 0;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

}
</style>
