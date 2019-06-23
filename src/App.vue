<template>
  <div id="app">
    <transition>
          <router-view></router-view>
    </transition>

  </div>
</template>

<script>
export default {
  name: 'app',
  components: {}
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
