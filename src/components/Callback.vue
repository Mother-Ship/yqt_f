<template>

</template>

<script setup>
import {inject, onMounted, ref} from "vue";
import {getParam, post} from '@/util/util.js'

//获取URL中的query参数code
let codeVal = getParam('code');
const code = ref(codeVal);

async function fetch() {
  const response = await post("/api/login/apiV2CallBack?code=" + code.value);
  // 请求成功，处理响应数据
  window.location.href = "#roomList";
}


onMounted(() => {
  fetch();
})

</script>

<style scoped>

</style>