import Vue from 'vue'
import App from './App.vue'
import Chat from './assets/vue-beautiful-chat.umd.min.js'
import vmodal from 'vue-js-modal'
import router from './router';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(vmodal, {dialog: true})
Vue.use(Chat)
Vue.use(ElementUI)
// Vue.use(router)

// eslint-disable-next-line
new Vue({
  el: '#app',
  router,
  render: (h) => h(App)
})
