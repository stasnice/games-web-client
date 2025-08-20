<template>
  <div class="wrapper">
    <div class="left">
      <img :src="carBet.car.iconFront" alt="" class="icon" />
    </div>
    <div class="right">
      <div class="info-line">
        {{ carBet.totalBetAmount }}
      </div>
      <div class="info-line">
        {{ myBetAmount }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type ICarBetDto from 'components/RacingGame/Interfaces/CarBetDto.interface';

defineProps<{
  carBet: ICarBetDto;
  myBetAmount: number;
}>();

// With <script setup>, props.carBet and props.myBetAmount are
// directly accessible in the template without needing to prefix with `props.`.
// However, within the <script setup> block itself, you would use `props.carBet`.
</script>

<style scoped>
.left {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.right {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.info-line {
  padding: 2px 0;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
}

.wrapper {
  display: flex;
  flex-direction: row;
  background-color: ghostwhite;
  margin: 5px;
  padding: 5px 0;
  border-radius: 10px;
  width: 120px;
}
.bet-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.icon {
  width: 50px;
  height: 50px;
}
</style>
