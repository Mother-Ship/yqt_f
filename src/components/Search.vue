<script setup>

import {onMounted, ref} from "vue";
import axios from "axios";


// 搜索相关
const showSuggestionList = ref(false);
const showImage = ref(true);
const suggestions = ref([]);
defineExpose({
  showSuggestionList
})
async function onSearch(keyword) {
  try {
    var url = '';
    if (!isNaN(keyword)) {
      url = `https://api.sayobot.cn/v2/beatmapinfo?0=${keyword}`;
    } else {
      url = `https://api.sayobot.cn/beatmaplist?0=20&1=0&2=4&3=${keyword}&5=1`;
    }
    const response = await axios.get(url);
    const status = response.status;
    if (status === -1) {
      console.log('请求失败');
      return;
    }
    const data = response.data.data;

    if (Array.isArray(data)) {
      console.log('Response is an array');
      // Handle array data
      suggestions.value = data;
    } else if (typeof data === 'object' && data !== null) {
      //用SID搜索会返回单条结果
      suggestions.value = [data];
    }
  } catch (error) {
    // 请求失败，处理错误
    console.error('请求出错', error);
  }

  showSuggestionList.value = true;
}

function hideImage() {
  // Hide the image if loading fails
  showImage.value = false;
}

import { defineEmits } from 'vue'
const emits = defineEmits(['onSelectSuggestion'])

function selectSuggestion(suggestion) {

  showSuggestionList.value = false;
  //传值给父组件，听歌界面和建房界面的搜索条目点击行为不一样
  emits('onSelectSuggestion', suggestion);
}

function getCover(sid) {
  return `https://cdn.sayobot.cn:25225/beatmaps/${sid}/covers/cover.webp`;
}

</script>

<template>
  <!--  搜索-->
  <div class="nav-search">
    <div>
      <d-search icon-position="left" no-border style="width: 200px" @search="onSearch"></d-search>
    </div>
    <ul v-if="showSuggestionList" class="suggestion-list">
      <li v-for="suggestion in suggestions" :key="suggestion" @click="selectSuggestion(suggestion)">
        <img v-if="showImage" :src="getCover(suggestion.sid)" alt="123" class="suggestion-image" @error="hideImage"/>
        <span class="suggestion-text">{{
            suggestion.artistU === "" ? suggestion.artist : suggestion.artistU
          }} - {{
            suggestion.titleU === "" ? suggestion.title : suggestion.titleU
          }} ({{ suggestion.creator }})</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.nav-search {
  position: relative;
}

.suggestion-list {
  position: absolute;
  z-index: 999;
  background-color: #fff;
  border: 1px solid #ccc;
  border-top: none;
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-image {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}
</style>