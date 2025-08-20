<template>
  <div class="overlay" @click.self="close">
    <div v-if="loadingHistory && !history.length" class="loader">
      <span class="spinner"></span>
    </div>
    <div class="popup" v-if="history.length" ref="popupRef">
      <session-details
        v-if="sessionId"
        :sessionId="sessionId"
        @closeDetails="toggleSessionId('')"
      ></session-details>
      <ul v-else>
        <li class="history-header">
          <span>TIME</span>
          <span>RESULT</span>
          <span>WINNERS</span>
          <span>PRIZES</span>
        </li>
        <li
          v-for="el in history"
          :key="el.sessionId"
          class="history-item"
          @click="toggleSessionId(el.sessionId)"
        >
          <span>{{ formatTime(el.sessionTime) }}</span>
          <img :src="el.result.iconSide" alt="icon" class="icon" />
          <span>{{ el.winnersCount }}</span>
          <span>{{ el.prizes }}</span>
        </li>
      </ul>
      <div v-if="loadingHistory" class="loader">
        <span class="spinner"></span>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, onMounted, reactive, ref, nextTick } from 'vue';
import { getHistory } from 'src/api/api';
import { useAuthStore } from 'src/stores/auth';
import SessionDetails from './sessionDetails.vue';
import type IGetHistoryDto from 'components/RacingGame/Interfaces/GetHostoryDto.interface';
import { useRouter } from 'vue-router';

const offset = ref(0);
const loadingHistory = ref(true);
const limit = ref(20);
const sessionId = ref('');
const router = useRouter();

const emit = defineEmits(['close']);
const popupRef = ref<HTMLElement | null>(null);

const history = reactive<IGetHistoryDto[]>([]);

onMounted(async () => {
  await updateHistory();
  await nextTick();

  function handleScroll() {
    const el = popupRef.value;
    if (
      el &&
      el.scrollTop + el.clientHeight >= el.scrollHeight - 50 &&
      !loadingHistory.value
    ) {
      console.log('Reached bottom!, start loading');
      void updateHistory();
    }
  }

  popupRef.value?.addEventListener('scroll', handleScroll);
});

function toggleSessionId(id: string) {
  sessionId.value = id;
}

async function updateHistory() {
  loadingHistory.value = true;
  const token = useAuthStore().loadTokenFromStorage();
  const appId = useAuthStore().getAppId();


  console.log('appId on get history', appId);

  if (!token || !appId) {
    void router.push('/login');
    return;
  }

  const response = await getHistory({
    offset: offset.value,
    limit: limit.value,
  }, token, appId);

  if (response) {
    offset.value += 20;
  }

  history.push(...response.data);
  loadingHistory.value = false;
}

function close() {
  emit('close');
}

function formatTime(dateStr: Date) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5); /* затемнення */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup {
  background: white;
  padding: 0 10px;
  border-radius: 8px;
  width: 400px;
  max-height: 80vh;
  min-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  background-color: white;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 3px;
  margin-bottom: 5px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  place-items: center;
}

.history-item:hover {
  filter: brightness(0.9);
  transform: scale(1.05);
  transition: 0.3s ease;
}

.icon {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #ccc;
  border-top-color: #666;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.history-header {
  position: sticky;
  top: 0;
  background-color: #ac79e1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 20px 10px;
  border-bottom: 2px solid #ccc;
  font-weight: bold;
  font-size: 12px;
  color: whitesmoke;
  z-index: 1;
  text-align: center;
  border-radius: 0 0 8px 8px;
}
</style>
