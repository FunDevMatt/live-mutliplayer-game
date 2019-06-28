<template>
  <main>
    <div class="gameContent">
      <p v-if="loadingUsersIn">Loading Game...</p>
      <p v-if="!showVideos">Loading webcams</p>

      <p v-if="!loadingUsersIn" style="color: white">{{ name}} VS {{ opponent.name }}</p>
      <div id="content">
        <div id="chatBox">
          <div id="messages">
            <p v-for="(message, index) in messages" :key="index">
              <span v-if="message.username === currentPlayer.name">You:</span>
              <span v-if="message.username !== currentPlayer.name">{{ message.username }}:</span>
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
          <div id="my-video-div" style="width: 300px; height: 300px; border: 1px solid black"></div>
          <div id="remote-media-div" style="width: 300px; height: 300px; border: 1px solid black"></div>
        </div>
      </div>
    </div>
  </main>
</template>


<script>
import io from "socket.io-client";
import { mapState } from "vuex";
import axios from "axios";
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
      showVideos: false
    };
  },
  computed: mapState(["nspSocket", "socket", "usersOnline"]),

  async mounted() {
    let myVideo = document.querySelector("#myVideo");
    let matchVideo = document.querySelector("#matchVideo");

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
          video: true
        });
        let room = await connect(
          token,
          {
            name: roomName,
            tracks: localTracks
          }
        );

        room.on("disconnected", room => {
          this.$store.commit("updateShowUserLeftMatchAlert", true);

          this.$router.push({
            name: "register"
          });
        });
        // get Remote Video for person who created Room
        room.participants.forEach(participant => {
          if (participant.identity !== this.$props.name) {
            participant.tracks.forEach(publication => {
              if (publication.isSubscribed) {
                const track = publication.track;
                track;
                document
                  .getElementById("remote-media-div")
                  .appendChild(track.attach());
              }
            });

            participant.on("trackSubscribed", track => {
              document
                .getElementById("remote-media-div")
                .appendChild(track.attach());
            });
          }
        });

        //   get Remote Video for person who joins room

        room.on("participantConnected", participant => {
          console.log(`Participant "${participant.identity}" connected`);

          participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
              const track = publication.track;
              document
                .getElementById("remote-media-div")
                .appendChild(track.attach());
            }
          });

          participant.on("trackSubscribed", track => {
            document
              .getElementById("remote-media-div")
              .appendChild(track.attach());
          });
        });

        let track = await createLocalVideoTrack();
        const localMediaContainer = document.getElementById("my-video-div");
        localMediaContainer.appendChild(track.attach());
      } catch (e) {
        console.log(e);
      }
    });

    this.nspSocket.on("message-received", message => {
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
  }
};
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
    transform: translate(-50%, -60%);
  }
  #chatBox {
    height: 100%;
    background-color: white;
    flex: 1;
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
    flex: 3;
  }
  #sendDiv {
    flex: 1;
  }
  #videoContainer {
    width: 100%;
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
  #content {
    display: flex;
    min-width: 900px;
  }
  #videoContainer {
    flex: 4;
    height: 100%;
  }
}
</style>
