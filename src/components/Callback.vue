<template>
  <div>{{ username }}</div>
</template>

<script setup>
import {inject, onMounted, ref} from "vue";
import{getParam}from '@/util/util.js'

//获取URL中的query参数code
let codeVal = getParam('code');




const code = ref(codeVal);

const axios = inject('axios')

let usernameVal = null;
let username = ref(usernameVal);

function fetch() {
  axios.post("http://k3.mothership.top:8095/api/login/apiV2CallBack?code=" + code.value)
      .then((res) => {
        if (res.status >= 200 && res.status < 300) {
          // 请求成功，处理响应数据
          username.value = res.data.data.username;
          console.log(res.headers);
          localStorage.setItem('Authorization', res.headers['authorization']);
          window.location.href = "#roomList";
        } else {
          // 请求失败，抛出一个错误
          throw new Error(`请求失败: ${res.status} ${res.statusText}`);
        }

      })
      .catch(error => {
        // 捕获错误，并进行错误处理
        console.error(error.message);
      });
}


onMounted(() => {
  fetch();

})

</script>

<style scoped>

</style>