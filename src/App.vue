<template>
  <v-app>
    <div id="app">
      <router-view></router-view>
    </div>
  </v-app>
</template>

<script>
export default {
  name: "app",
  components: {},
  mounted() {}
};
</script>


<style>
* {
  text-align: center;
  padding: 0;
  margin: 0;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  box-sizing: border-box;
}
body {
  background-color: rgb(231, 231, 231)
}
</style>
