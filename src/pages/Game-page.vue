<template>
    <main>
        <div class="gameContent">
            <p v-if="loadingUsersIn">Loading Game...</p>
            <p v-if="!loadingUsersIn" style="color: white">{{ name}} VS {{ opponent.name }}</p>
            <div id="gameBoard" v-if="!loadingUsersIn">
                <GameCanvas></GameCanvas>
            </div>

        </div>
     </main>
</template>


<script>
import $store from "../store/state-store";
import io from 'socket.io-client';
import { setTimeout } from 'timers';
import GameCanvas from "../components/Game-Canvas";



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
    components: {
        GameCanvas

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
        
            $store.state.socket.disconnect();
            $store.state.nspSocket.disconnect();
            $store.commit("updateUsersOnline", data)

            this.$router.push({
                    name: "register"
                })

            alert(`${this.opponent.name} has left the game`)
        })
            
    }
    
}
</script>


<style lang="scss" scoped>
    main {
        height: 100vh;
        background-color: blueviolet;
        position: relative;

        .gameContent {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -60%)
        }



    }
    

</style>
