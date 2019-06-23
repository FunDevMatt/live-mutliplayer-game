import Vue from 'vue'
import App from './App.vue'
import GamePage from './pages/Game-page.vue';
import RegisterPage from './pages/Register-page.vue'
import VueRouter from 'vue-router'

Vue.config.productionTip = false
Vue.use(VueRouter)


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
    }
  ]
})


// send user back to register page if they refresh
if (performance.navigation.type == 1) {
  router.push({
    name: "register"
  })
}



new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

export default router;