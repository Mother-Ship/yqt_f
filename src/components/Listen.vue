<script setup>
import {onMounted, ref, watch} from "vue";
//先实现打开页面直接下载某个固定SID播放
import axios from 'axios';
import JSZip from 'jszip';
import localForage from "localforage";
import {getParam, post} from '@/util/util.js'
import {formatTime} from '@/util/util.js'
import {NotificationService} from 'vue-devui/notification';
import {onBeforeUnmount} from "@vue/runtime-core";

import Search from './Search.vue';

const volume = ref(50); // 创建响应式数据 volume

//获取URL中的query参数 roomId
let roomId = getParam('roomId');


const members = ref([]);
let ws = null;

function refreshToken() {
  post('/api/login/refreshToken', {});
}

//页面挂载时连接websocket
onMounted(async () => {
  await refreshToken();

  var protocol = localStorage.getItem('Authorization');
  ws = new WebSocket("ws://" + import.meta.env.VITE_BACKEND_URL +":8095/websocket/" + roomId.value, [protocol]);
  ws.onopen = function () {
    NotificationService.open({
      title: '房间连接成功',
      type: 'success',
      duration: 3000
    });
  };

  ws.onmessage = function (evt) {
    let data = JSON.parse(evt.data);
    if (data.type === 'FULL_ROOM_INFO' || data.type === 'ROOM_USER') {
      members.value = data.data.users;
    }

    if (data.type === 'FULL_ROOM_INFO' || data.type === 'PLAYING_INFO') {
      console.log('刷新播放');
      sid.value = data.data.current_beatmap_set_id;
      beatmapName.value = data.data.current_beatmap_name;
      startTime.value = data.data.server_timestamp - data.data.current_beatmap_start_timestamp
      preload(data.data.next_beatmap_set_id);
      startPlayback();
    }

    if (data.type === 'FULL_ROOM_INFO' || data.type === 'PLAY_LIST') {
      playedQueue.value = data.data.played_queue.reverse();
      notPlayedQueue.value = data.data.not_played_queue;
    }
    if (data.type === 'MESSAGE') {
      NotificationService.open({
        title: data.message,
        type: data.success ? 'info' : 'error',
        duration: 3000
      });
    }
  };
  ws.onclose = function () {
    NotificationService.open({
      title: '房间连接断开',
      type: 'info',
      duration: 3000
    });
    window.location.href = "#roomList";
  };

});
onBeforeUnmount(() => {
  if (audioRef.value) audioRef.value.pause()
});

function getAvatar(uid) {
  return `https://a.ppy.sh/${uid}?1685328494.jpeg`;
}

//预缓存


async function preload(sid) {
  const cachedMp3Data = await localForage.getItem('cachedMp3_' + sid);
  if (cachedMp3Data) {
    console.log('已缓存' + sid);
    return;
  }
  console.log('开始缓存' + sid);
  const response = await axios.get('https://txy1.sayobot.cn/beatmaps/download/mini/' + sid, {
    responseType: 'arraybuffer'
  });

  const zip = new JSZip();
  const zipFile = await zip.loadAsync(response.data);
  let mp3File = zipFile.file(/\.mp3$/)[0];

  if (!mp3File) {
    mp3File = zipFile.file(/\.ogg$/)[0];
  }
  const mp3Data = await mp3File.async('arraybuffer');
  if (mp3Data) {
    // Store the mp3Data in local storage
    localForage.setItem('cachedMp3_' + sid, mp3Data);
  } else {
    NotificationService.open({
      title: '缓存失败',
      type: 'error',
      duration: 3000,
      content: 'sid:' + sid
    });
  }
}


//播放相关
const sid = ref(-1);
const beatmapName = ref("");
//服务器下发的时间戳 - 服务器下发的歌曲开始时间戳 = 本地开始播放的时间戳
const startTime = ref(0);
const audioRef = ref(null);

function updateVolume() {
  const audio = document.querySelector('audio');
  if (audio) {
    audio.volume = volume.value / 100; // 使用 volume.value 来获取响应式数据的值
  }
}

async function startPlayback() {
  //处理偶发的时间算错导致前面的歌没放完开始放后面的
  if (audioRef.value) audioRef.value.pause()

  let mp3Data;
  const cachedMp3Data = await localForage.getItem('cachedMp3_' + sid.value);
  if (cachedMp3Data !== null) {
    mp3Data = cachedMp3Data
  } else {
    NotificationService.open({
      content: '未找到本地缓存，开始缓存',
    });
    await preload(sid.value);
    mp3Data = await localForage.getItem('cachedMp3_' + sid.value);
  }


  if (mp3Data) {
    audioRef.value = new Audio();
    let audio = audioRef.value;
    audio.src = URL.createObjectURL(new Blob([mp3Data]));
    audio.volume = volume.value / 100;
    if (playing.value) {
      var resp = audio.play();
      if (resp !== undefined) {
        resp.then(_ => {
        }).catch(error => {
          console.log(error);
          NotificationService.open({
            content: '当前浏览器设置无法自动播放，请调整；\n' +
                'edge/chrome直接在设置中搜索【媒体自动播放】添加当前域名即可；\n' +
                '移动端/没有该项设置的浏览器，可以手动暂停/继续一次',
          });
        });
      }
    }

    //设置音频起始播放时间
    audio.currentTime = startTime.value / 1000;

    //每秒更新音频进度到页面上
    audio.ontimeupdate = updateProgress;

    //监听音量
    watch(volume, () => {
      audio.volume = volume.value / 100;
    });

    audio.onended = async () => {
      await localForage.removeItem('cachedMp3_' + sid.value);
    }
  } else {
    console.log('从缓存、osz中都找不到mp3文件');
  }

}

//播放进度条
const progressPercent = ref(0);
const currentTime = ref(0);
const duration = ref(0);

//确保audio对象不是null之后再调用
function updateProgress() {

  const audioPlayer = audioRef.value;
  currentTime.value = audioPlayer.currentTime;
  duration.value = audioPlayer.duration;
  progressPercent.value = (currentTime.value / duration.value) * 100;
}

//暂停继续
const playing = ref(true);
const playButtonText = ref("暂停播放");

function togglePlay() {
  const audioPlayer = audioRef.value;
  if (playing.value) {
    audioPlayer.pause();
  } else {
    audioPlayer.play();
    ws.send("refresh");
  }
  playing.value = !playing.value;
  if (playButtonText.value === "暂停播放") {
    playButtonText.value = "继续播放";
  } else {
    playButtonText.value = "暂停播放";
  }
}

//播放列表
const showPlayedQueue = ref(false);
const showNotPlayedQueue = ref(false);
const playedQueue = ref([]);
const notPlayedQueue = ref([]);

function switchShowPlayedQueue() {
  showPlayedQueue.value = !showPlayedQueue.value;
  if (showPlayedQueue) {
    showNotPlayedQueue.value = false;
  }
}

function switchShowNotPlayedQueue() {
  showNotPlayedQueue.value = !showNotPlayedQueue.value;
  if (showNotPlayedQueue) {
    showPlayedQueue.value = false;
  }
}

//官网链接
function openPpySh() {
  window.open('https://osu.ppy.sh/beatmapsets/' + sid.value);
}

//切歌
function voteForSwitch() {
  ws.send("vote");
  NotificationService.open({
    content: '已进行投票',
  });
}

//退出房间
function exit() {
  ws.close();
  window.location.href = "#roomList"
}

//点歌
function handleSelectSuggestion(suggestion) {
  ws.send("order_" + suggestion.sid);
  NotificationService.open({
    content: '点歌' + suggestion.artistU === "" ? suggestion.artist : suggestion.artistU
    + '-' +
    suggestion.titleU === "" ? suggestion.title : suggestion.titleU
        + '(' + suggestion.creator + ')成功',
  });
}

const search = ref()
const handleGlobalClick = (event) => {
  search.value.showSuggestionList = false;
}
</script>

<template>
  <Search ref="search" @onSelectSuggestion="handleSelectSuggestion"/>
  <div @click="handleGlobalClick">
    <!--音量-->
    <div class="volume-control">
      <label for="volume-slider">音量:</label>
      <input
          id="volume-slider"
          v-model="volume"
          max="100"
          min="0"
          type="range"
          @input="updateVolume"
      />
    </div>

    <!--  控制按钮-->
    <div>
      <d-button @click="togglePlay">{{ playButtonText }}</d-button>
      <d-button @click="openPpySh">打开官网</d-button>
      <d-button @click="voteForSwitch">投票切歌</d-button>
    </div>

    <!--  成员列表-->
    <div>
      当前房间成员：

      <ul>
        <li v-for="member in members" :key="member">
          <d-avatar :height="32" :img-src=getAvatar(member.id) :isRound="true" :width="32"></d-avatar>
          <span class="suggestion-text">{{ member.name }}</span>
        </li>
      </ul>

    </div>


    <!--进度条-->
    <div class="progress-bar">
      <div class="progress-container">
        <d-progress :percentage=progressPercent></d-progress>
      </div>
    </div>
    <br>
    <!--    播放时间，格式化为分秒格式-->
    <div>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>


    <!--  歌曲信息-->
    <div v-if="notPlayedQueue.length > 0">
      当前播放：{{ notPlayedQueue[0].beatmap_set_name }}
    </div>
    <div v-if="notPlayedQueue.length > 0">
    点歌人：{{ notPlayedQueue[0].creator_name }}
    </div>

    <!--  播放列表-->
    <div>
      <d-button @click="switchShowNotPlayedQueue">已放列表</d-button>
      <d-button @click="switchShowPlayedQueue">待放列表</d-button>
      <d-button @click="exit">退出房间</d-button>

      <ul v-if="showPlayedQueue">
        <li v-for="song in playedQueue" :key="song">
          <span class="suggestion-text">{{ song.sort }} .</span>
          <span class="suggestion-text">{{ song.beatmap_set_name }}</span>
          <br>
          <span class="suggestion-text">{{ song.creator_name }}</span>
        </li>
      </ul>


      <ul v-if="showNotPlayedQueue">
        <li v-for="song in notPlayedQueue" :key="song">
          <span class="suggestion-text">{{ song.sort }} .</span>
          <span class="suggestion-text">{{ song.beatmap_set_name }}</span>
          <br>
          <span class="suggestion-text">{{ song.creator_name }}</span>
        </li>
      </ul>


    </div>
  </div>
</template>

<style scoped>
.progress-container {
  margin-bottom: 20px;
}


.progress-bar {
  width: 30%;
  height: 10px;
  background-color: #ddd;
}


</style>
