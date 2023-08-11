<script setup>
var token = localStorage.getItem('token');
const isShow = token == null || token.length() === 0;

function jumpOAuth() {
    window.location.href = 'https://osu.ppy.sh/oauth/authorize?client_id=23054&redirect_uri=http%3A%2F%2Fk3.mothership.top%3A5173%2F%23apiV2CallBack&response_type=code&scope=public+identify'
}

</script>

<template>
    <button v-if="isShow" @click="jumpOAuth">点击登录</button>
</template>

<style scoped>

</style>
