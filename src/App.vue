<template>
  <div id="app">
    <transition name="router-animation" enter-active-class="animated pulse" leave-active-class="animated pulse">
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
@import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css";



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
