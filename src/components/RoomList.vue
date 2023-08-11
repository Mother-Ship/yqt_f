<script setup>

// 创建一个响应式的数据 ref
import {onMounted, ref} from "vue";
import axios from "axios";
import Search from "@/components/Search.vue";

const itemList = ref([]);

// 使用 onMounted 钩子，在组件挂载时发送请求
onMounted(async () => {
  try {
    var Authorization = localStorage.getItem('Authorization');
    const response = await axios.post('http://k3.mothership.top:8095/api/listen/roomList', {}, {
      headers: {
        'Authorization': Authorization
      }
    });
    // 请求成功，将数据存储到 itemList.value 中
    itemList.value = response.data.data;
    if (response.headers['authorization'] != null) {
      localStorage.setItem('Authorization', response.headers['authorization']);
    }
  } catch (error) {
    // 请求失败，处理错误
    console.error('请求出错', error);
  }

});
const onRowClick = (params) => {
  window.location.href = "#listen?roomId=" + params.row.id;
};
//选歌建房
async function handleSelectSuggestion(suggestion) {
  console.log(suggestion.sid);
  var Authorization = localStorage.getItem('Authorization');
  const response = await axios.post('http://k3.mothership.top:8095/api/listen/createRoom?sid='+suggestion.sid, {}, {
    headers: {
      'Authorization': Authorization
    }
  });
  if (response.headers['authorization'] != null) {
    localStorage.setItem('Authorization', response.headers['authorization']);
  }
  window.location.href = "#listen?roomId=" + response.data.data;

  showSearch.value = false;
}
const showSearch = ref(false);
//创建房间，展示搜索框
function createRoom() {
  showSearch.value = true;
}

const search=ref()
const handleGlobalClick = (event) => {
  search.value.showSuggestionList = false;
}
</script>

<template>
  <Search @onSelectSuggestion="handleSelectSuggestion" v-if="showSearch" ref="search"/>
  <div  @click="handleGlobalClick">
  <d-button @click="createRoom">创建房间</d-button>
  <d-table :data="itemList" style="width: 100%"     @row-click="onRowClick">
    <d-column field="name" header="房间名"></d-column>
    <d-column field="user_count" header="人数"></d-column>
  </d-table>
  </div>
</template>

<style scoped>

</style>