<template>
    <div class="content">
        <div v-if="loadingUsersVideo">
            <p>Connecting you to a dev!</p>
        </div>
        <div id="remote-media-div">
            <div id="my-media-div"></div>
        </div>

    </div>
    <!-- <div>
        <div id="loading" v-if="!showMessages">Loading</div>
        <div id="content-grid">
        <div id="my-media-div"></div>
        <div id="remote-media-div"></div>
        <div id="chatContainer" v-if="showMessages">
            <div id="messageArea">
            <p v-for="(message, index) in messages" :key="index">
                <span v-if="message.username === currentPlayer.name">You: </span>
                <span v-if="message.username !== currentPlayer.name">{{message.username}}: </span>
                {{ message.text }}
                </p>
            </div>
            <div id="sendArea">
            <div id="textField">
                <v-text-field label="Solo" solo v-model="message"></v-text-field>
            </div>
            <div id="sendBtn">
                <v-btn @click="sendMessage()" color="danger">Send</v-btn>
            </div>
            </div>
        </div>
        </div>
     </div> -->
</template>


<script>
import io from "socket.io-client";
import { mapState } from "vuex";
import axios from "axios";
import { setTimeout } from 'timers';
const {
  connect,
  createLocalTracks,
  createLocalVideoTrack
} = require("twilio-video");

export default {
  name: "Game-page",
  props: ["namespace", "name"],
  data() {
    return {
      loadingUsersVideo: true,  
      currentPlayer: "",
      opponent: "",
      showLeftMatch: false,
      attendees: 0,
      message: "",
      messages: [],
      showNames: false,
      showMessages: false,
      opponentTracks: [],
      localTrack: []
    };
  },
  computed: mapState(["nspSocket", "socket", "usersOnline"]),

  async mounted() {

    navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

    if (!navigator.getUserMedia) {
      alert("Navigator not supported in this browser")
    }  


    let nspSocketConnection = await io(
      `${process.env.VUE_APP_SERVER_URL}${this.$props.namespace}`
    );
    this.$store.commit("updateNspSocket", nspSocketConnection);

    this.nspSocket.on("connect", () => {
      this.nspSocket.emit("user-ready", this.$props.name);
      this.$store.commit("updateNspSocket", this.nspSocket);
    });

    this.nspSocket.on("connect_error", e => {
      console.log(e);
    });

    this.nspSocket.on("match-info", async data => {
      // only one user creates the room
      if (data[0].name === this.$props.name) {
        try {
          let room = await axios.post(
            `${process.env.VUE_APP_SERVER_URL}/create-room`
          );
          this.nspSocket.emit("new-room-info", room);
        } catch (e) {
          console.log(e);
        }
      }

      for (let player in data) {
        if (data[player].name !== this.$props.name) {
          this.opponent = data[player];
          this.$store.commit("updateOpponent", this.opponent);
        } else {
          this.currentPlayer = data[player];
        }
      }
    });

    this.nspSocket.on("room-info", async data => {
      try {
        let token = data.token;
        let roomName = await data.uniqueName;
        let localTracks = await createLocalTracks({
          audio: true,
          video: { width: 320}
        });
        // connect to room that
        let room = await connect(
          token,
          {
            name: roomName,
            tracks: localTracks,
            preferredVideoCodecs: ["VP8", "H264"]
          }
        );

        // The creator of the room will be alerted when the matched dev has joined
        room.on("participantConnected", participant => {
          console.log(`Participant "${participant.identity}" connected`);

          // checks the tracks the participant already has
          participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
              const track = publication.track;
              this.opponentTracks.push(track);
            }
          });

          participant.on('trackAdded', (track) => {
            console.log("TRACK ADDED")
            this.opponentTracks.push(track)
          });

          // handle any new tracks the particpant adds
          participant.on("trackSubscribed", track => {
                            console.log(2)

            this.opponentTracks.push(track);
          });
        });

        // for the user that joins, he needs to grab the tracks for the  user that is already in the room
        room.participants.forEach(participant => {
          if (participant.identity !== this.$props.name) {
            participant.tracks.forEach(publication => {
              if (publication.isSubscribed) {
                const track = publication.track;
                this.opponentTracks.push(track);
              }
            });
            participant.on("trackSubscribed", track => {
              this.opponentTracks.push(track);
            });
          }
        });

        room.localParticipant.on(
          "trackPublicationFailed",
          (error, localTrack) => {
            console.warn(
              'Failed to publish LocalTrack "%s": %s',
              localTrack.name,
              error.message
            );
          }
        );

        room.on(
          "trackSubscriptionFailed",
          (error, remoteTrackPublication, remoteParticipant) => {
            console.warn(
              'Failed to subscribe to RemoteTrack "%s" from RemoteParticipant "%s": %s"',
              remoteTrackPublication.trackName,
              remoteParticipant.identity,
              error.message
            );
          }
        );

        // Display your video locally for yourself to see
        let track = await createLocalVideoTrack({ width: 320 });
        console.log("da", track)
        this.localTrack = track;
        console.log(this.localTrack)


        // handle room disconnects
        room.on("disconnected", room => {
          this.$store.commit("updateShowUserLeftMatchAlert", true);

          this.$router.push({
            name: "register"
          });
        });
      } catch (e) {
        console.log(e);
      }
    });

    this.nspSocket.on("message-received", message => {
      console.log(message)
      this.messages.push(message);
    });

    this.nspSocket.on("user-left", () => {
      let socketConnection = this.socket;
      socketConnection.disconnect();
      nspSocketConnection.disconnect();

      this.$store.commit("updateShowUserLeftMatchAlert", true);

      this.$router.push({
        name: "register"
      });
    });
  },
  methods: {
    sendMessage() {
      this.nspSocket.emit("message-sent", this.message);
    }
  },
  watch: {
          opponentTracks(val)  {
              console.log("opponent tracks", val);
              if (val.length === 2 && this.localTrack) {
                const localMediaContainer = document.getElementById("my-media-div");
                localMediaContainer.appendChild(this.localTrack.attach());

                const matchMediaContainer = document.getElementById("remote-media-div");
                val.forEach(track => {
                    console.log("track appending", track)
                    matchMediaContainer.appendChild(track.attach());
                })
                let contentGrid = document.querySelector("#content-grid");
                setTimeout(() => {
                    this.loadingUsersVideo = false;
                }, 500)


                 
              }
          }
    
  }
};
</script>


<style lang="scss">
  * {
        box-sizing: border-box;
  }
    .content {
        background-color: #E3E3E3;
        min-height: 100vh;
        overflow: hidden;

        #remote-media-div {
            width: 44rem;
            max-width: 100vw;
            margin: 6rem auto 0 auto;
            position: relative;

            #my-media-div {
                position: absolute;
                width: 10rem;
                bottom: 1rem;
                left: 1rem;
                z-index: 20;
            }


            video {
                width: 100%;
                top: 0;
                left: 0;
                background-size: cover;
                border-radius: 2rem;
                -webkit-box-shadow: 0px 10px 17px -5px rgba(0,0,0,0.75);
-moz-box-shadow: 0px 10px 17px -5px rgba(0,0,0,0.75);
box-shadow: 0px 10px 17px -5px rgba(0,0,0,0.75);

            }
        }
    }
</style>
