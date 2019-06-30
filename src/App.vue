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


<style lang="scss">
* {
  padding: 0;
  margin: 0;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  box-sizing: border-box;
  color: #FFFFFF;
}
body {
  background-color: #3EADFF;
}
</style>
