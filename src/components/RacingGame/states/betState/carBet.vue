<template>
  <div>
    <div
      class="wrapper"
      :class="{ 'active-border': myBet?.isActive }"
      @click="pickBet"
    >
      <div>{{ carBet.car.standartOdds }} / {{ carBet.dynamicOdds }}</div>
      <div>
        <img :src="carBet.car.iconFront" alt="" class="car-img" />
      </div>
      <div>{{ carBet.car.name }}</div>
      <div>{{ carBet.totalBetAmount }}</div>
      <div class="orange-bar">
        {{ myBet?.betAmount + myBet?.currentInput || 0 }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type ICarBetDto from 'components/RacingGame/Interfaces/CarBetDto.interface';
import type IPlayerBetLocal from 'components/RacingGame/Interfaces/PlayerBetLocal.interface';

const props = defineProps<{
  carBet: ICarBetDto;
  myBet: IPlayerBetLocal;
}>();

const emit = defineEmits(['betPicked']);

const pickBet = () => {
  emit('betPicked', {
    id: props.carBet.id,
    isActive: !props.myBet.isActive,
  });
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px;
  background-color: ghostwhite;
  margin: 5px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid transparent;
}

.wrapper:hover {
  filter: brightness(0.9);
  transform: scale(1.05);
  transition: 0.3s ease;
}

.car-img {
  width: 150px;
  height: 150px;
}

.orange-bar {
  width: 80%;
  height: 20px;
  background-color: orange;
  margin: 5px auto;
  border-radius: 5px;
  justify-content: center;
  display: flex;
  align-items: center;
}

.active-border {
  border: 1px solid orange;
}
</style>
