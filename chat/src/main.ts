import './assets/main.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { vClickOutsideDirective } from './directives';

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 全局注册指令
app.directive('click-outside', vClickOutsideDirective);

// 全局注册插件
app.use(createPinia())
app.use(router)

// 挂载应用
app.mount('#app')
