<template>
    <main>
        <div class="gameContent">
            <p v-if="loadingUsersIn">Loading Game...</p>
            <p v-if="!loadingUsersIn" style="color: white">{{ name}} VS {{ opponent.name }}</p>
             <form>
      <textarea id="incoming"></textarea>
      <button type="submit">submit</button>
      <video src=""></video>
    </form>
    <pre id="outgoing"></pre>

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

    async mounted() {
        var Peer = require('simple-peer')

// get video/voice stream
        navigator.getUserMedia({ video: true, audio: false }, gotMedia, () => {
            console.log("USERS CONNECTED")
        })

        function gotMedia (stream) {
            var peer1 = new Peer({ initiator: true, stream: stream })
            var peer2 = new Peer({ stream: stream})

            peer1.on('signal', data => {
                peer2.signal(data)
            })

            peer2.on('signal', data => {
                peer1.signal(data)
            })

            peer2.on('stream', stream => {
                // got remote video stream, now let's show it in a video tag
                var video = document.querySelector('video')
                console.log(video)
                if ('srcObject' in video) {
                video.srcObject = stream
                } else {
                video.src = window.URL.createObjectURL(stream) // for older browsers
                }
                
                video.play()
            })
            }


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
