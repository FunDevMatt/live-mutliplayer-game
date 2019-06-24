import Vue from 'vue'
import App from './App.vue'
import GamePage from './pages/Game-page.vue';
import RegisterPage from './pages/Register-page.vue';
import GameCanvas from "./components/Game-Canvas.vue";
import VueRouter from 'vue-router'
import Vuetify from 'vuetify';
import store from "./store/state-store"


Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(Vuetify)


const router = new VueRouter({
  routes: [{
      name: 'register',
      path: '',
      component: RegisterPage
    },
    {
      name: 'game',
      path: '/game/:namespace',
      component: GamePage,
      props: true,
    },
    {
      name: 'canvas',
      path: '/canvas',
      component: GameCanvas
    },
  ]
})

import 'vuetify/dist/vuetify.min.css'

// send user back to register page if they refresh
// if (performance.navigation.type == 1) {
//   router.push({
//     name: "register"
//   })
// }



new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

export default router;