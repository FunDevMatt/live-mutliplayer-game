<template>
    <main>
        <div class="gameContent">
            <p v-if="loadingUsersIn">Loading Game...</p>
            <p v-if="!showVideos">Loading webcams</p>

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
            <div id="videoContainer">
                <video id="myVideo"></video>
                <video id="matchVideo"></video>

            </div>

        </div>
     </main>
</template>


<script>
import io from 'socket.io-client';
import { mapState } from 'vuex'





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
            messages: [],
            peerConnections: '',
            showVideos: false
        }
    },
    computed: mapState(['nspSocket', 'socket', 'usersOnline']),

    async mounted() {

        navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

        var peer = new Peer({key: 'lwjd5qra8257b9'});

        let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true});

        let myVideo = document.querySelector("#myVideo");
        let matchVideo = document.querySelector("#matchVideo");

        let nspSocketConnection = await io(`${process.env.VUE_APP_SERVER_URL}${this.$props.namespace}`);
        this.$store.commit("updateNspSocket", nspSocketConnection);

        this.nspSocket.on('connect', () => {
           this.nspSocket.emit("user-ready", this.$props.name);
           this.$store.commit("updateNspSocket", this.nspSocket);

        })

        this.nspSocket.on("connect_error", (e) => {
            console.log(e)
        })



        peer.on('open', id => {
            this.nspSocket.emit("peer-id", {
                peerId: id,
                name: this.$props.name
            });
        })




        this.nspSocket.on("match-info", (data) => {
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


        this.nspSocket.on("message-received", (message) => {
            this.messages.push(message);         
        })

        this.nspSocket.on("peer-connections", (data) => {
            this.peerConnections = data;
            
            let peerId = this.peerConnections[this.opponent.name];
            var call = peer.call(peerId, stream)
            call.on('stream', (matchStream) => {
                myVideo.srcObject = stream;
                matchVideo.srcObject = matchStream;
                myVideo.play();
                matchVideo.play();
                this.showVideos = true;


            })

        })

        peer.on('call', function(call) {
                call.answer(stream);
                call.on('stream', (matchStream) => {
                myVideo.srcObject = stream;
                matchVideo.srcObject = matchStream;
                myVideo.play();
                matchVideo.play();
                this.showVideos = true;

            })
        });

        this.nspSocket.on("user-left", () => {
            let socketConnection = this.socket;
            socketConnection.disconnect();
            nspSocketConnection.disconnect();

            this.$store.commit("updateShowUserLeftMatchAlert", true)            

            this.$router.push({
                    name: "register"
                })
        })


            
    },
    methods: {
        sendMessage() {
            this.nspSocket.emit("message-sent", this.message)

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

        #videoContainer {
            width: 100%;
            height: 300px;
            position: relative;
        }

        #myVideo {
            position: absolute;
            height: 100px;
            left: 0;
            bottom: 0;
            z-index: 10;
        }

        #matchVideo {
            position: absolute;
            width: 100%;
            height: 100%;
            bottom: 0;
            left: 0;
            z-index: 1;
        }



    }
    

</style>
