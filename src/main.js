import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import VueAxios from "vue-axios";
import axios from "axios";

import DevUI from 'vue-devui';
import 'vue-devui/style.css';
import '@devui-design/icons/icomoon/devui-icon.css';
import { ThemeServiceInit, infinityTheme } from 'devui-theme';

ThemeServiceInit({ infinityTheme }, 'infinityTheme');


const app = createApp(App)

//注入axios
app.use(VueAxios, axios)
app.provide('axios', app.config.globalProperties.axios)

app.use(DevUI)

app.mount('#app')