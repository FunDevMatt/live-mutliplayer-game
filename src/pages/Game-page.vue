<template>
  <main>
    <video id="testVideo"></video>
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
  </main>
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
      loadingUsersIn: true,
      currentPlayer: "",
      opponent: "",
      showLeftMatch: false,
      attendees: 0,
      message: "",
      messages: [],
      loadedUsers: 0,
      showNames: false,
      showMessages: false,
      opponentTracks: [],
      localTrack: []
    };
  },
  computed: mapState(["nspSocket", "socket", "usersOnline"]),

  async mounted() {


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
          video: { height: 400 }
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
              console.log(1)
              this.opponentTracks.push(track);
            }
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
        let track = await createLocalVideoTrack({ height: 400 });
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
                    track.dimensions.height = 400
                    matchMediaContainer.appendChild(track.attach());
                })
                let contentGrid = document.querySelector("#content-grid");
                setTimeout(() => {
                    contentGrid.classList.add("opacity-important")
                }, 500)


                 
              }
          }
    
  }
};
</script>


<style lang="scss">
@keyframes fadeUp {
    100% {opacity: 1; transform: translateY(0)}
    
}
.opacity-important {
    animation-name: fadeUp;
    animation-fill-mode: forwards;
    animation-duration: 1s;
    animation-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1)
}
main {
  position: relative;
  width: 100vw;

  #content-grid {
    display: grid;
    width: 80vw;
    height: 500px;
    margin: 75px auto 0 auto;
    grid-template-areas:
      "chat1 chat1 chat2 chat2"
      "textChat textChat textChat textChat";
    justify-items: center;
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    opacity: 0;
    transform: translateY(50%);

    #my-media-div {
      width: 100%;
      height: 100%;
      grid-area: chat1;
    }

    #remote-media-div {
      width: 100%;
      height: 100%;
      grid-area: chat2;
    }

    #chatContainer {
      height: 300px;
      width: 100%;
      grid-area: textChat;
      background-color: #9dc1fc;
      border-radius: 20px;
      position: relative;
      display: flex;
      flex-direction: column;

      #messageArea {
        flex: 4;
        width: 100%;
        background-color: #9dc1fc;
        border-radius: 20px;
        padding: 5px 10px;
        overflow: scroll;
      }

      #sendArea {
        flex: 1;
        width: 100%;
        background-color: #9dc1fc;
        border-radius: 20px;
        padding: 5px 10px;
        display: flex;

        #textField {
          flex: 4;
        }

        #sendBtn {
          flex: 1;
        }
      }
    }

    video {
      width: 100%;
      border-radius: 20px;
      -webkit-box-shadow: -4px 10px 22px 0px rgba(0, 0, 0, 0.75);
      -moz-box-shadow: -4px 10px 22px 0px rgba(0, 0, 0, 0.75);
      box-shadow: -4px 10px 22px 0px rgba(0, 0, 0, 0.75);
    }
  }
}
</style>
