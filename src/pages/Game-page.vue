<template>
    <main>
        <div class="gameContent">
            <p v-if="loadingUsersIn">Loading Game...</p>
            <p v-if="!loadingUsersIn" style="color: white">{{ name}} VS {{ opponent.name }}</p>
            <!-- <div id="gameBoard" v-if="!loadingUsersIn">
                <GameCanvas></GameCanvas>
            </div> -->

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
            opponent: '',
            showLeftMatch: false
        }
    },
    components: {
        GameCanvas

    },

    mounted() {
    

        this.$store.state.nspSocket = io(`http://localhost:3500${this.$props.namespace}`);

        this.$store.state.nspSocket.on('connect', () => {
           this.$store.state.nspSocket.emit("user-ready", this.$props.name)
           this.$store.commit("updateNspSocket", this.$store.state.nspSocket)

        })

        this.$store.state.nspSocket.on("match-info", (data) => {
            for (let player in data) {

                if (data[player].name !== this.$props.name) {
                    this.opponent = data[player];
                    this.$store.commit("updateOpponent", this.opponent);
                } else {
                    this.currentPlayer = data[player]
                }
            }
            this.loadingUsersIn = false
        })

        this.$store.state.nspSocket.on("user-left", (data) => {
        
            this.$store.state.socket.disconnect();
            this.$store.state.nspSocket.disconnect();
            this.$store.commit("updateUsersOnline", data)
            this.$store.commit("updateShowUserLeftMatchAlert", true)            

            this.$router.push({
                    name: "register"
                })
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
