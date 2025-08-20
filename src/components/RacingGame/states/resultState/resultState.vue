<template>
  <div>
    <result-car-bet :carBet="raceSession.result.winner" />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import ResultCarBet from './resultCarBet.vue';
import type IRacingSessionLocal from 'components/RacingGame/Interfaces/RacingSessionLocal.interface';

defineProps<{
  raceSession: IRacingSessionLocal;
}>();

</script>

<style lang="scss" scoped></style>
