<template>
    <h1>This si the game </h1>
    </template>


<script>
import $store from "../store/state-store";
import io from 'socket.io-client';


export default {
    name: 'Game-page',
    props: ['namespace', 'name'],
    mounted() {
        $store.state.socket.disconnect();
        $store.commit("updateSocket", '');

        $store.state.nspSocket = io(`http://localhost:3500${this.$props.namespace}`);
        $store.state.nspSocket.on('connect', () => {
           $store.state.nspSocket.emit("user-ready", this.$props.name)
        })
        $store.commit("updateNspSocket", $store.state.nspSocket)

        $store.state.nspSocket.on("match-info", (data) => {
            console.log(data)
        })

        $store.state.nspSocket.on("user-left", () => {
            alert("USER HAS DISCONNECTED")
        })
            
    }
    
}
</script>


<style lang="sass" scoped>

</style>
