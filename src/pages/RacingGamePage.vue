<template>
  <div id="main-container">
    <div v-if="racingSession.sessionId">
      <race-header :raceSession="racingSession" />
      <div v-if="racingSession.state === 'BET'">
        <bet-state :raceSession="racingSession" @betSelected="betSelectHandle" />
        <div class="bet-control-wrapper">
          <button
            @click="decreaseTotalBet"
            :disabled="totalBetInput <= 0"
            class="bet-button minus-button"
          >
            -
          </button>
          <div class="total-bet-display">Total: {{ totalBetInput }}</div>
          <button @click="increaseTotalBet" class="bet-button plus-button">+</button>
          <button
            @click="makeBet"
            :disabled="processingBetEvent || totalBetInput <= 0"
            class="play-button"
          >
            Play
          </button>
        </div>
      </div>
      <div
        v-else-if="
          racingSession.state === 'GAME_IN_PROGRESS' ||
          racingSession.state === 'START_IN_PROGRESS'
        "
      >
        <racing-state :raceSession="racingSession" />
      </div>
      <div v-else-if="racingSession.state === 'RESULT'">
        <result-state :raceSession="racingSession" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { initSocketConnection } from '../socket/socket.service';
import type ISocketResponse from 'src/interfaces/SocketResponse.interface';
import type IRacingSessionDto from 'components/RacingGame/Interfaces/RacingsessionDto.interface';
import ERacingGameStates from 'components/RacingGame/enums/RacingGameStates.enum';
import type ISocketSessionUpdateData from 'src/interfaces/SocketSessionUpdateData.interface';
import type IRacingSessionLocal from 'components/RacingGame/Interfaces/RacingSessionLocal.interface';
import RaceHeader from 'components/RacingGame/race-header.vue';
import BetState from 'components/RacingGame/states/betState/betState.vue';
import RacingState from 'components/RacingGame/states/racingState/racingState.vue';
import ResultState from 'components/RacingGame/states/resultState/resultState.vue';

const racingSession = reactive({} as IRacingSessionLocal);
const totalBetInput = ref(0);
const processingBetEvent = ref(false);
let socket: ReturnType<typeof initSocketConnection> | null = null;
const router = useRouter();

onMounted(() => {
  const token = useAuthStore().loadTokenFromStorage();


  if (!token) {
    void router.push('/login');
    return;
  }

  socket = initSocketConnection(token);
  console.log('connected socket ', socket);

  if (socket) {
    socket.emit('fe_racing_game_join', {}, (response: ISocketResponse<IRacingSessionDto>) => {
      console.log('response ack', response);
      const { data } = response;
      console.log(data);
      updateRaceSession(data, true);
    });

    socket.on('be_racing_game_session_updated', (data: ISocketSessionUpdateData) => {
      const { session } = data;
      updateRaceSession(session, false);
    });
  }
});

function updateRaceSession(incomingSession: IRacingSessionDto, shouldUpdateMyBets: boolean) {
  const oldState = racingSession.state;
  const shouldInitMyBets =
    shouldUpdateMyBets ||
    (oldState !== ERacingGameStates.BET && incomingSession.state === ERacingGameStates.BET);
  racingSession.sessionId = incomingSession.sessionId;
  racingSession.gameId = incomingSession.gameId;
  racingSession.gameName = incomingSession.gameName;
  racingSession.state = incomingSession.state;
  racingSession.timeLeft = incomingSession.timeLeft;
  racingSession.road = incomingSession.road; // ResponseRoad[];
  racingSession.carBets = incomingSession.carBets; // CarBetDto[];
  racingSession.totalBetsAmount = incomingSession.totalBetsAmount;
  racingSession.totalBetsCount = incomingSession.totalBetsCount;
  racingSession.result = incomingSession.result; // any | null;
  racingSession.configuration = incomingSession.configuration; //GameConfigurationDto;
  racingSession.membersCount = incomingSession.membersCount;
  racingSession.rewardData = incomingSession.rewardData; // IRewardData[] | null;

  if (shouldInitMyBets) {
    createMyBets(incomingSession);
    totalBetInput.value = 0;
  }
}

function betSelectHandle(data: { id: string; isActive: boolean }) {
  const { min } = racingSession.configuration.bets;
  const { isActive, id } = data;
  const shouldChangeTotal = totalBetInput.value === 0 && isActive;
  if (shouldChangeTotal) {
    totalBetInput.value = min;
  }

  const myBetToUpdate = racingSession.myBets.find((el) => el.carBetId === id);
  if (myBetToUpdate) {
    myBetToUpdate.isActive = isActive;
  }

  const numberOfActiveCarBets = racingSession.myBets.filter((el) => el.isActive).length;

  if (!isActive && numberOfActiveCarBets === 0) {
    totalBetInput.value = 0;
  }

  recalculateTotalAndCarBetsInputs(numberOfActiveCarBets);
}

function recalculateTotalAndCarBetsInputs(numberOfActiveCarBets: number) {
  const betPerCar =
    totalBetInput.value === 0 ? 0 : Math.floor(totalBetInput.value / numberOfActiveCarBets);
  const sumOfCarBets = betPerCar * numberOfActiveCarBets;
  const totalIsSame = sumOfCarBets === totalBetInput.value;
  totalBetInput.value = totalIsSame ? totalBetInput.value : sumOfCarBets;
  racingSession.myBets.forEach((el) => {
    if (el.isActive) {
      el.currentInput = betPerCar;
    } else {
      el.currentInput = 0;
    }
  });
}

function makeBet() {
  console.log('making Bet');
  processingBetEvent.value = true;
  const betDto = {
    bets: racingSession.myBets
      .filter((el) => el.isActive)
      .map((el) => {
        return { amount: el.currentInput, carBetId: el.carBetId };
      }), // [{ amount: +amount, carBetId }],
    sourceType: 'audio-room',
    sourceId: '174',
    // make bet socket event
    // reset all bets ?
  };

  console.log('betDto', betDto);

  socket!.emit('fe_racing_game_bet', betDto, (response: ISocketResponse<IRacingSessionDto>) => {
    console.log('response ack', response);
    const { message } = response;
    if (message) {
      console.log('Bet placed successfully!', response.data);
      // balance.value = response.data.balance;
      racingSession.myBets.forEach((el) => {
        el.betAmount += el.currentInput;
        el.currentInput = 0;
        el.isActive = false;
      });
      // You might want to update raceSession.myBets based on backend confirmation
      // or reset front-end state here if the backend confirms the bet.
    } else {
      console.error('Failed to place bet:', response);
      racingSession.myBets.forEach((el) => {
        el.currentInput = 0;
        el.isActive = false;
      });
      // Show an error message to the user
    }
    // Only set processingBetEvent to false AFTER the response is received
    processingBetEvent.value = false;
    totalBetInput.value = 0;
  });
}

function createMyBets(session: IRacingSessionDto) {
  racingSession.myBets = session.myBets
    ? session.myBets.map((el) => {
        return { ...el, currentInput: 0, isActive: false };
      })
    : session.carBets.map((el) => {
        return {
          carBetId: el.id,
          betAmount: 0,
          currentInput: 0,
          isActive: false,
        };
      });
}

function increaseTotalBet() {
  const { step } = racingSession.configuration.bets;
  const currentStep = step || 10; // Default step if not configured

  const numberOfActiveCarBets = racingSession.myBets.filter((el) => el.isActive).length;

  if (numberOfActiveCarBets === 0) {
    console.warn('Cannot increase total bet: No cars selected.');
    return;
  }

  totalBetInput.value += currentStep;
  recalculateTotalAndCarBetsInputs(numberOfActiveCarBets);
}

function decreaseTotalBet() {
  const { step, min } = racingSession.configuration.bets;
  const currentStep = step || 10; // Default step if not configured

  const numberOfActiveCarBets = racingSession.myBets.filter((el) => el.isActive).length;

  if (numberOfActiveCarBets === 0) {
    console.warn('Cannot decrease total bet: No cars selected.');
    return;
  }

  // Calculate the new value, ensuring it doesn't go below the sum of minimum bets
  const minTotalForActiveBets = numberOfActiveCarBets * (min || 0);
  let newValue = totalBetInput.value - currentStep;

  // Ensure totalBetInput doesn't drop below the minimum required for selected cars
  if (newValue < minTotalForActiveBets) {
    newValue = minTotalForActiveBets;
    // If setting to minTotalForActiveBets makes it 0, and there are no active cars, set to 0.
    // This handles the edge case where minTotalForActiveBets might be 0 but totalBetInput is still greater than 0
    if (minTotalForActiveBets === 0 && newValue === 0) {
      // If there are no active cars, and minTotal is 0, then total input should be 0.
    }
  }

  // Also ensure it doesn't go below 0 if minTotalForActiveBets is 0
  if (newValue < 0) {
    newValue = 0;
  }

  // If after calculation, the new value is 0 and there are active bets,
  // we might want to ensure it still reflects the `min` for each selected car
  // or set `totalBetInput` to 0 and deactivate all bets.
  // This logic depends on whether `totalBetInput` of 0 means no active bets.
  if (newValue === 0 && numberOfActiveCarBets > 0) {
    // If the intent is that totalBetInput can be 0 only if no bets are active,
    // then when it hits 0 with active bets, we should deactivate them all.
    racingSession.myBets.forEach((el) => {
      el.isActive = false;
      el.currentInput = 0;
    });
    totalBetInput.value = 0;
    return; // Exit after reset
  }

  totalBetInput.value = newValue;
  recalculateTotalAndCarBetsInputs(numberOfActiveCarBets);
}
</script>

<style>
#main-container {
  padding: 0;
  margin: 0 auto;
  width: 70%;
}
.bet-control-wrapper {
  display: flex;
  left: 50%;
  width: 50%; /* 50% length */
  height: 40px; /* 40px height */
  background-color: #333; /* Dark background */
  color: white;
  justify-content: space-between; /* Space out items */
  align-items: center; /* Center items vertically */
  padding: 0 10px; /* Some padding on sides */
  margin: 15px auto;
  border-top-left-radius: 8px; /* Rounded corners */
  border-top-right-radius: 8px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2); /* Subtle shadow */
}

.bet-button {
  background-color: #f4a600; /* Blue button */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 1.2em;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.play-button {
  background-color: #f4a600; /* Blue button */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 1.2em;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.play-button:hover:not(:disabled) .bet-button:hover:not(:disabled) {
  background-color: #f4cd6f;
}

.play-button:disabled {
  background-color: #735012ff;
  cursor: not-allowed;
}

.bet-button:disabled {
  background-color: #735012ff;
  cursor: not-allowed;
}

.total-bet-display {
  font-size: 1.1em;
  font-weight: bold;
}
</style>
