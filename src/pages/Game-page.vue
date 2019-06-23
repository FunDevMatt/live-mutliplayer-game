<template>
    <div>
        <p v-if="loadingUsersIn">Loading Game...</p>
        <p v-if="!loadingUsersIn">You have been matched against {{ opponent.name }}</p>
        <div id="gameBoard" v-if="!loadingUsersIn"></div>

    </div>
</template>


<script>
import $store from "../store/state-store";
import io from 'socket.io-client';
import router from "../main"



export default {
    name: 'Game-page',
    props: ['namespace', 'name'],
    data() {
        return {
            loadingUsersIn: true,
            currentPlayer: '',
            opponent: '' 
        }
    },
    mounted() {

        $store.state.nspSocket = io(`http://localhost:3500${this.$props.namespace}`);

        $store.state.nspSocket.on('connect', () => {
           $store.state.nspSocket.emit("user-ready", this.$props.name)
           $store.commit("updateNspSocket", $store.state.nspSocket)

        })

        $store.state.nspSocket.on("match-info", (data) => {
            for (let player in data) {

                if (data[player].name !== this.$props.name) {
                    this.opponent = data[player];
                } else {
                    this.currentPlayer = data[player]
                }
            }
            this.loadingUsersIn = false
        })

        $store.state.nspSocket.on("user-left", (data) => {
            alert(`${this.opponent.name} has left the game`)
            $store.state.socket.disconnect();
            $store.state.nspSocket.disconnect();
            $store.commit("updateUsersOnline", data)

            router.push({
                    name: "register"
                })
            
        })
            
    }
    
}
</script>


<style lang="scss" scoped>

    #gameBoard {
        height: 100vh;
        background-color: pink
    }

    .box {
        width: 80px;
        height: 20px;
        background-color: white;
    }

</style>
