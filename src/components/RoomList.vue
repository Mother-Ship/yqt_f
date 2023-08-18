<script setup>

// 创建一个响应式的数据 ref
import {onMounted, ref} from "vue";
import {post} from "@/util/util";
import Search from './Search.vue';

const itemList = ref([]);

// 使用 onMounted 钩子，在组件挂载时发送请求
onMounted(async () => {
  const response = await post('/api/listen/roomList', {});
  if ((response).status === 200) {
    itemList.value = response.data.data;
  }
});


const onRowClick = (params) => {
  window.location.href = "#listen?roomId=" + params.row.id;
};

//选歌建房
async function handleSelectSuggestion(suggestion) {
  console.log(suggestion.sid);
  const response = await post('/api/listen/createRoom?sid=' + suggestion.sid, {});
  window.location.href = "#listen?roomId=" + response.data.data;
  showSearch.value = false;
}


const showSearch = ref(false);

//创建房间，展示搜索框
function createRoom() {
  showSearch.value = true;
}

const search = ref()
const handleGlobalClick = (event) => {
  search.value.showSuggestionList = false;
}

</script>

<template>
  <Search v-if="showSearch" ref="search" @onSelectSuggestion="handleSelectSuggestion"/>

  <div>
    <d-button @click="createRoom">创建房间</d-button>
    <d-table :data="itemList" style="width: 100%" @row-click="onRowClick">
      <d-column field="name" header="房间名"></d-column>
      <d-column field="user_count" header="人数"></d-column>
      <template #empty>
        <div style="text-align: center;">没有房间</div>
      </template>
    </d-table>
  </div>

</template>

<style scoped>

</style>