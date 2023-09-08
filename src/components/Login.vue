<script setup>
var token = localStorage.getItem('token');
const isShow = token == null || token.length() === 0;

function jumpOAuth() {
  window.location.href = 'https://osu.ppy.sh/oauth/authorize' +
      '?client_id=' + import.meta.env.VITE_CLIENT_ID
      + '&redirect_uri=http%3A%2F%2F' + import.meta.env.VITE_BACKEND_URL + '%3A5173%2F%23apiV2CallBack'
      + '&response_type=code&scope=public+identify'
}

</script>

<template>
  <d-button v-if="isShow" size="lg" @click="jumpOAuth">点击登录</d-button>
</template>

<style scoped>

</style>
