import Vue from 'vue'
import App from './App.vue'
import GamePage from './pages/Game-page.vue';
import RegisterPage from './pages/Register-page.vue'
import VueRouter from 'vue-router'


Vue.config.productionTip = false
Vue.use(VueRouter)

const router = new VueRouter({
  routes: [{
      path: '',
      component: RegisterPage
    },
    {
      path: '/game',
      component: GamePage
    }
  ]
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')