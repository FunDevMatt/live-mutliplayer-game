import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)


const store = new Vuex.Store({
    state: {
        socket: '',
        nspSocket: '',
        usersOnline: 0,
        showUserLeftMatchAlert: false,
        opponent: ''
    },
    mutations: {
        updateSocket(state, payLoad) {
            state.socket = payLoad
        },
        updateNspSocket(state, payLoad) {
            state.nspSocket = payLoad;
        },
        updateUsersOnline(state, payLoad) {
            state.usersOnline = payLoad;
        },
        updateShowUserLeftMatchAlert(state, payLoad) {
            state.showUserLeftMatchAlert = payLoad;
        },
        updateOpponent(state, payLoad) {
            state.opponent = payLoad;
        }

    }
})

export default store