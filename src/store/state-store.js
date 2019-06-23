import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)


const store = new Vuex.Store({
    state: {
        socket: '',
        nspSocket: '',
        usersOnline: 0
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
        }
    }
})

export default store