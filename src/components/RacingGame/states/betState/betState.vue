<template>
  <div class="road-wrapper">
    <div
      v-for="(roadPart, index) in raceSession.road"
      :key="index"
      class="bet-road-part"
      :class="'road-' + roadPart.roadType"
      :style="{
        height: '50px',
        width: roadPart.length * 100 + '%',
        backgroundColor: getRoadColor(roadPart.roadType),
      }"
    >
      {{ roadPart.roadType }}
    </div>
  </div>
  <div class="bets-container" v-if="raceSession.sessionId">
    <div v-for="carBet in raceSession.carBets" :key="carBet.id">
      <car-bet :carBet="carBet" :myBet="getMyBet(carBet.id)" @betPicked="handleBetPicked" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'; // Explicitly import utilities for Composition API
import CarBet from './carBet.vue';
import CONSTANTS from '../../../../constants/constants';
import type IRacingSessionLocal from 'components/RacingGame/Interfaces/RacingSessionLocal.interface';
import type ERoadTypes from 'components/RacingGame/enums/RoadTyprs.enum';

const props = defineProps<{
  raceSession: IRacingSessionLocal;
}>();

// 2. Define Emits: Use defineEmits() macro
const emit = defineEmits(['betSelected']);

// 3. Methods: Convert to regular functions
import type IPlayerBetLocal from 'components/RacingGame/Interfaces/PlayerBetLocal.interface';

const getMyBet = (carBetId: string): IPlayerBetLocal => {
  // Always return an IPlayerBetLocal, falling back to default if not found
  return (
    props.raceSession.myBets.find((el) => el.carBetId === carBetId) ?? {
      carBetId,
      betAmount: 0,
      currentInput: 0,
      isActive: false,
    }
  );
};

const getRoadColor = (roadType: ERoadTypes) => {
  return CONSTANTS.roadColors[roadType] || '#cccccc';
};

const handleBetPicked = (betData: { id: string, isActive: boolean }) => {
  // Emit events using the `emit` function
  emit('betSelected', betData);
};

// No need for `export default {}` when using `<script setup>`
</script>

<style scoped>
.bets-container {
  display: flex;
  justify-content: center;
}

.bet-road-part {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  text-shadow: 1px 1px 2px black;
  border-radius: 4px;
  margin: 0 2px;
  padding: 0 8px;
  min-width: 80px;
}

/* Road type styles */
.road-BUMPY {
  background: repeating-linear-gradient(45deg, #663300, #663300 10px, #4d2600 10px, #4d2600 20px);
}

.road-DIRT {
  background: linear-gradient(to right, #996633, #8c5c2d);
}

.road-HIGHWAY {
  background-color: #323232;
  background-image: linear-gradient(to right, transparent 45%, #ffffff33 50%, transparent 55%);
  background-size: 40px 100%;
}

.road-DESERT {
  background: linear-gradient(45deg, #edc9af, #f0d9b5);
}

.road-POTHOLES {
  background: radial-gradient(circle at 10% 20%, #3a3a3a 10%, #505050 30%, #3a3a3a 50%);
}

.road-EXPRESSWAY {
  background-color: #0064c8;
  background-image: linear-gradient(to right, #004a99 10%, #0064c8 90%);
}

.road-UNKNOWN {
  background: repeating-linear-gradient(135deg, #800080, #5c005c 20px, #800080 40px);
}

.road-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  width: 100%;
  padding: 10px 0;
}
</style>
