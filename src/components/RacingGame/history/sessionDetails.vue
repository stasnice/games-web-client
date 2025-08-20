<template>
  <div v-if="loading" class="loader">
    <span class="spinner"></span>
  </div>
  <div v-else>
    <div class="details-header">
      <div class="details-wrapper">
        <button @click="closeDetails">Close</button>
        {{ sessionDetails?.session?.sessionId }}
      </div>
      <div class="details-summery-wrappers">
        <div class="left">
          <div class="header-info-line">
            members: {{ sessionDetails?.session?.membersCount }}
          </div>
          <div class="header-info-line">
            bets: {{ sessionDetails?.session?.totalBetsAmount }}
          </div>
          <div class="header-info-line">
            (Tip: {{ sessionDetails?.tips }})
          </div>
        </div>
        <div class="right">
          <img
            :src="sessionDetails?.session?.result?.winner?.car?.iconFront"
            alt=""
            class="icon"
          />
        </div>
      </div>
    </div>
    <div class="leaderboard">
      <ul>
        <li class="leaderboard-header">
          <span>RANK</span>
          <span>WINNERS</span>
          <span>TOTAL SPEND</span>
          <span
            >SPEND
            {{ sessionDetails?.session?.result?.winner?.car?.name }}</span
          >
          <span>PRIZE</span>
        </li>
        <li
          v-for="el in sessionDetails.leaderboard"
          :key="el.userId"
          class="leaderboard-item"
        >
          <span>{{ el.rank }}</span>
          <span>
            {{ el.userName }}
          </span>
          <span>{{ el.totalSpend }}</span>
          <span>{{ el.winnerBetSpend }}</span>
          <span>{{ el.prize }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  defineEmits,
  defineProps,
  nextTick,
  onMounted,
  reactive,
  ref,
} from 'vue';
import { getSessionDetails } from 'src/api/api';
import { useAuthStore } from 'src/stores/auth';
import { useRouter } from 'vue-router';
import type ISessionDetailDto from 'components/RacingGame/Interfaces/SessionDetailDto.interface';

const props = defineProps({
  sessionId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['closeDetails']);

const router = useRouter();
const sessionDetails = reactive({} as ISessionDetailDto);
const loading = ref(true);

onMounted(async () => {
  await getSessionDetail();
  await nextTick();
});

function closeDetails() {
  emit('closeDetails');
}

async function getSessionDetail() {
  const token = useAuthStore().loadTokenFromStorage();
  const appId = useAuthStore().getAppId();

  if (!token || !appId) {
    void router.push('/login');
    return;
  }

  loading.value = true;

  const response = await getSessionDetails({ sessionId: props.sessionId }, token, appId);
  const details = response.data;

  if (response) {
    Object.assign(sessionDetails, details);
  }
  console.log('session details', details);
  console.log('sessionDetails', sessionDetails);
  loading.value = false;
}
</script>

<style scoped>
.details-wrapper {
  display: flex;
  justify-content: center; /* по горизонталі */
  align-items: center; /* по вертикалі */
  margin: 5px;
  margin-bottom: 1rem;
}

.details-summery-wrappers {
  display: flex;
  flex-direction: row;
  background-color: ghostwhite;
  margin: 5px;
  padding: 5px 0;
  border-radius: 10px;
  width: 100%;
}

.left {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  padding-left: 20px;
}

.right {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-info-line {
  padding: 2px 0;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
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

.icon {
  width: 70px;
  height: 70px;
}

.leaderboard-header,
.leaderboard-item {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  padding: 5px 0;
  text-align: center;
  place-items: center;
}

.leaderboard-header {
  position: sticky;
  top: 0;
  background-color: #ac79e1;
  font-weight: bold;
  font-size: 12px;
  color: whitesmoke;
  z-index: 1;
  border-radius: 0 0 8px 8px;
  border-bottom: 2px solid #ccc;
}

.leaderboard-item {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 5px;
}

/* Truncate long usernames */
.leaderboard-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Especially for the userName column (2nd column) */
.leaderboard-item span:nth-child(2) {
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: flex-start;
  width: 100%;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
