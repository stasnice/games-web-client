<template>
  <div class="top-bar">
    <div class="user-info">👤 {{ currentUserName }}</div>
    <div class="button-group">
      <button class="popup-button" @click="isPopupVisible = true">👥 History</button>
      <button class="popup-button logout" @click="logOut">🚪 Logout</button>
    </div>

    <history-popup
      v-if="isPopupVisible"
      @close="isPopupVisible = false"
    ></history-popup>
  </div>
  <div class="session-info">
    <div class="info-group">
      <div class="info-item">👥 Users: {{ raceSession?.membersCount }}</div>
      <div class="info-item">💰 Total Bets: {{ raceSession?.totalBetsAmount }}</div>
      <div class="info-item">⏳ Time Left: {{ countdown }}s</div>
    </div>
    <div class="info-group">
      <div class="info-item">🆔 ID: {{ raceSession.sessionId }}</div>
      <div class="info-item">🎮 State: {{ raceSession.state }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref, watch } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import type IRacingSessionLocal from 'components/RacingGame/Interfaces/RacingSessionLocal.interface';
import { disconnectSocket } from '../../socket/socket.service.js';
import { useRouter } from 'vue-router';
import HistoryPopup from 'components/RacingGame/history/historyPopup.vue';

const router = useRouter();
const props = defineProps<{
  raceSession: IRacingSessionLocal;
}>();

const countdown = ref(0);
const currentUserName = ref<string>('');
const isPopupVisible = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  startCountdown(props.raceSession.timeLeft);
  await getCurrentUser();
})

async function getCurrentUser() {
  const userData = await useAuthStore().getUserData();

  console.log('userData', userData);
  if (userData) {
    currentUserName.value = userData?.name;

    return;
  }


  currentUserName.value = 'Unknown';
}

function logOut() {
  console.log('from logout on header button');
  useAuthStore().logout();
  void router.push('/login');
  disconnectSocket();
}

function startCountdown(ms: number) {
  // Clear any previous timer
  if (timer) clearInterval(timer);

  countdown.value = Math.round(ms / 1000); // convert ms to seconds

  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      if (timer !== null) {
        clearInterval(timer);
      }
    }
  }, 1000);
}


watch(
  () => props.raceSession.timeLeft,
  (newVal) => {
    startCountdown(newVal); // Start new countdown
  }
);
</script>

<style scoped>

.session-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 1rem;
}

.info-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.info-item {
  padding: 8px 16px;
  background-color: #f0f2f5;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ccc;
  font-weight: bold;
}

.user-info {
  font-size: 16px;
  color: #333;
}

.button-group {
  display: flex;
  gap: 10px;
}

.popup-button {
  padding: 6px 14px;
  background-color: #007bff;
  color: white;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.popup-button:hover {
  background-color: #0056b3;
}

.popup-button.logout {
  background-color: #dc3545;
}

.popup-button.logout:hover {
  background-color: #a71d2a;
}
</style>
