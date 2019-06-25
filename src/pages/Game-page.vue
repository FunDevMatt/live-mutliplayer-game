<template>
    <main>
        <div class="gameContent">
            <p v-if="loadingUsersIn">Loading Game...</p>
            <p v-if="!loadingUsersIn" style="color: white">{{ name}} VS {{ opponent.name }}</p>
            <div v-if="!loadingUsersIn" id="chatBox">
                <div id="messages">
                    <p v-for="(message, index) in messages" :key="index">
                        <span v-if="message.username === currentPlayer.name">You: </span>
                        <span v-if="message.username !== currentPlayer.name">{{ message.username }}: </span>
                        {{ message.text }}
                    </p>
                </div>
                <div id="send">
                    <div id="messageDiv">
                        <input v-model="message" type="text" id="messageInput">
                    </div>
                    <div id="sendDiv">
                        <button @click="sendMessage()">OK</button>
                    </div>
                </div>
            </div>
            <video id="myVideo"></video>
            <video id="matchVideo"></video>

        </div>
     </main>
</template>


<script>
import io from 'socket.io-client';
import ss from "socket.io-stream";
import { setTimeout } from 'timers';




export default {
    name: 'Game-page',
    props: ['namespace', 'name'],
    data() {
        return {
            loadingUsersIn: true,
            currentPlayer: '',
            opponent: '',
            showLeftMatch: false,
            message: '',
            messages: []
        }
    },
    components: {

    },

    async mounted() {
        let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true});

        let myVideo = document.querySelector("#myVideo");
        let matchVideo = document.querySelector("#matchVideo");

        myVideo.srcObject = stream;

        this.$store.state.nspSocket = io(`http://localhost:3500${this.$props.namespace}`);

        this.$store.state.nspSocket.on('connect', () => {
           this.$store.state.nspSocket.emit("user-ready", this.$props.name);
           this.$store.commit("updateNspSocket", this.$store.state.nspSocket);

           myVideo.play();

        
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
            this.loadingUsersIn = false;
    

        })


        this.$store.state.nspSocket.on("message-received", (message) => {
            this.messages.push(message);         
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


            
    },
    methods: {
        sendMessage() {
            this.$store.state.nspSocket.emit("message-sent", this.message)

        }
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

        #chatBox {
            width: 400px;
            height: 500px;
            background-color: white;
        }

        #messages {
            width: 100%;
            height: 450px;
        }

        #send {
            width: 100%;
            height: 50px;
            border: 1px solid black;
            display: flex;
            align-items: center;
        }

        #messageDiv {
            flex: 3
        }

        #sendDiv {
            flex: 1;
        }



    }
    

</style>
