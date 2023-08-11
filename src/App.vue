<script setup>
import Login from './components/Login.vue'
import Callback from './components/Callback.vue'
import Listen from './components/Listen.vue'
import RoomList from './components/RoomList.vue'


import {computed, ref} from "vue";

const routes = {
    'apiV2CallBack': Callback,
    'login': Login,
    'listen': Listen,
    'roomList': RoomList,
}
const currentPath = ref(window.location.hash)

// 实现简单的路由
window.addEventListener('hashchange', () => {
    currentPath.value = window.location.hash
})
const currentView = computed(() => {
    let i = currentPath.value.indexOf('?');
    if (i === -1) i = currentPath.value.length;
    return routes[currentPath.value.slice(1, i) || '/']
})
</script>

<template>
    <component :is="currentView"/>
</template>

<style scoped>

</style>
