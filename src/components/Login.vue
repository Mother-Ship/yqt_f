<script setup>
var token = localStorage.getItem('token');
const isShow = token == null || token.length() === 0;

function jumpOAuth() {
    // window.location.href = 'https://osu.ppy.sh/oauth/authorize?client_id=23054&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2F%23apiV2CallBack&response_type=code&scope=public+identify'
    window.location.href = 'https://osu.ppy.sh/oauth/authorize?client_id=24068&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2F%23apiV2CallBack&response_type=code&scope=public+identify'
}

</script>

<template>
    <d-button v-if="isShow" size="lg" @click="jumpOAuth">点击登录</d-button>
</template>

<style scoped>

</style>
