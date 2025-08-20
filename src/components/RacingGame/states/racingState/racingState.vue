<template>
  <div>
    <div class="header-wrapper">
      <div v-for="carBet in raceSession.carBets" :key="carBet.id">
        <in-progres-car-bet
          :carBet="carBet"
          :myBetAmount="getMyBetAMount(carBet.id)"
        />
      </div>
    </div>
    <div
      class="road-wrapper"
      v-for="(carBet, index) in raceSession.carBets"
      :key="carBet.id"
      :ref="
        (refEl) => {
          if (refEl && 'tagName' in refEl) {
            roadWrappers[index] = refEl as HTMLElement;
          } else {
            roadWrappers[index] = null;
          }
        }
      "
    >
      <div
        v-for="(roadPart, partIndex) in raceSession.road"
        :key="partIndex"
        class="bet-road-part"
        :class="'road-' + roadPart.roadType"
        :style="{ width: roadPart.length * 100 + '%' }"
      ></div>

      <img
        :id="`car-${carBet.car.id}`"
        :src="carBet.car.iconTop"
        alt="car"
        class="car-icon"
        :style="{ transform: 'translateX(-50px)' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, defineProps } from 'vue';
import InProgresCarBet from './inProgresCarBet.vue';
import type IRacingSessionLocal from 'components/RacingGame/Interfaces/RacingSessionLocal.interface';
import ERacingGameStates from 'components/RacingGame/enums/RacingGameStates.enum';
import type IGameCarRenderDataDto from 'components/RacingGame/Interfaces/GameCarRenderDataDto.interface';
import type ERoadTypes from 'components/RacingGame/enums/RoadTyprs.enum';
import type { ResponseRoad } from 'components/RacingGame/racing-game';
import type IGameCarTimelineDto from 'components/RacingGame/Interfaces/IGameCarTimeline.dto';

const props = defineProps<{
  raceSession: IRacingSessionLocal;
}>();

// Use an array to store refs, as v-for with ref normally populates an array
const roadWrappers = ref<(HTMLElement | null)[]>([]);

// Important: Clear the array before re-rendering or animation starts to avoid stale refs
watch(
  roadWrappers,
  () => {
    // This watch helps ensure `roadWrappers` array is correctly populated
    // after V-for finishes rendering.
    // However, Vue handles this mostly automatically for simple ref arrays.
    // Explicitly resetting is often useful if the list structure changes dynamically.
    // For now, let's keep it simple as it was.
  },
  { flush: 'post' }
); // Ensure this runs after DOM updates

function getMyBetAMount(carBetId: string) {
  if (Array.isArray(props.raceSession.myBets)) {
    return (
      props.raceSession.myBets.find((el) => el.carBetId === carBetId)
        ?.betAmount || 0
    );
  }
  return 0;
}

function splitTimelineByRoadParts(timeline: IGameCarTimelineDto[], roadSegments:  ResponseRoad[]): {
  roadType: ERoadTypes;
  from: number;
  to: number;
  duration: number;
}[] {
  const result:{
    roadType: ERoadTypes;
    from: number;
    to: number;
    duration: number;
  }[] = [];
  let currentOffset = 0;

  timeline.forEach((seg) => {
    let remainingLength = seg.length;

    for (let i = 0; i < roadSegments.length && remainingLength > 0; i++) {
      const part = roadSegments[i];
      const partStart = roadSegments
        .slice(0, i)
        .reduce((acc, curr) => acc + curr.length, 0);
      const partEnd = partStart + part!.length;

      if (currentOffset >= partEnd) continue;

      const localStart = Math.max(currentOffset, partStart);
      const localEnd = Math.min(partEnd, currentOffset + remainingLength);
      const localLength = localEnd - localStart;

      if (localLength <= 0) continue;

      const ratio = localLength / seg.length;
      const duration = seg.duration * ratio;

      result.push({
        roadType: part!.roadType,
        from: localStart,
        to: localEnd,
        duration,
      });

      remainingLength -= localLength;
      currentOffset += localLength;
    }
  });

  return result;
}

function animateAllCars() {
  if (
    !props.raceSession.result ||
    !props.raceSession.result.renderData ||
    !Array.isArray(props.raceSession.result.renderData) ||
    !Array.isArray(props.raceSession.road)
  ) {
    console.warn(
      'Animation skipped: missing raceSession data or renderData/road is not an array.'
    );
    return;
  }

  const roadSegments = props.raceSession.road;

  props.raceSession.result.renderData.forEach((carData: IGameCarRenderDataDto) => {
    // Find the index of the carBet in raceSession.carBets to match it with roadWrappers array index
    const carBetIndex = props.raceSession.carBets.findIndex(
      (cb) => cb.car.id === carData.carId
    );

    if (carBetIndex === -1) {
      console.warn(`Car ID ${carData.carId} not found in raceSession.carBets.`);
      return;
    }

    const wrapperEl = roadWrappers.value[carBetIndex]; // Access by index
    const carElem = document.getElementById(`car-${carData.carId}`);

    if (!carElem || !wrapperEl) {
      console.warn(
        `Animation skipped for car ${carData.carId}: car element or wrapper element not found.`
      );
      return;
    }

    // Ensure image is loaded before accessing clientWidth
    // You might need a more robust image loading check for production
    const animateCar = (
      carId: number,
      timeline: {
        roadType: ERoadTypes;
        from: number;
        to: number;
        duration: number;
      }[],
      wrapperEl:  HTMLElement,
      carElement:  HTMLElement) => {
      const totalWidth = wrapperEl.clientWidth;
      // Get the actual car width after it's rendered and loaded
      const carWidth = carElement.clientWidth;

      let startPx = -50;

      function moveSegment(index: number) {
        if (index >= timeline.length) {
          return;
        }

        const seg = timeline[index];
        let toPx = seg!.to * totalWidth;

        // Ensure car stays within bounds, considering its width
        if (toPx > totalWidth - carWidth) {
          toPx = totalWidth - carWidth;
        }
        if (toPx < 0) toPx = 0;

        const animation = carElement.animate(
          [
            { transform: `translateX(${startPx}px)` },
            { transform: `translateX(${toPx}px)` },
          ],
          {
            duration: seg!.duration,
            fill: 'forwards',
            easing: 'linear',
          }
        );

        animation.onfinish = () => {
          startPx = toPx;
          moveSegment(index + 1);
        };
      }

      moveSegment(0);
    };

    const detailedTimeline: {
      roadType: ERoadTypes;
      from: number;
      to: number;
      duration: number;
    }[] = splitTimelineByRoadParts(
      carData.timeline,
      roadSegments
    );
    if (!(wrapperEl instanceof HTMLElement)) return;
    // Pass carElem directly to animateCar to avoid re-querying inside
    animateCar(carData.carId, detailedTimeline, wrapperEl, carElem);
  });
}

// Lifecycle Hooks and Watchers
onMounted(() => {
  // It's crucial that roadWrappers are populated before trying to animate
  // nextTick helps, but sometimes an image load might delay clientWidth
  // A simple heuristic: ensure session data is available
  if (props.raceSession.state === ERacingGameStates.GAME_IN_PROGRESS) {
    void nextTick(() => {
      // Small delay to ensure all images and DOM elements are fully rendered and measured
      setTimeout(() => animateAllCars(), 100);
    });
  }
});

watch(
  () => props.raceSession.state,
  async (newState, oldState) => {
    if (newState === ERacingGameStates.GAME_IN_PROGRESS && oldState !== ERacingGameStates.GAME_IN_PROGRESS) {
      // Clear roadWrappers array if component re-renders cars
      // This is important if `raceSession.carBets` array itself changes,
      // leading to new DOM elements.
      roadWrappers.value = [];
      await nextTick(() => {
        // Give a slight delay after DOM update for images to load and clientWidth to be accurate
        setTimeout(() => animateAllCars(), 100);
      });
    }
  },
  { immediate: true } // Run immediately on component creation
);

// We need to ensure that the roadWrappers array is properly reset when carBets changes
// or when the component is re-initialized (e.g., raceSession changes game ID)
watch(
  () => props.raceSession.carBets,
  () => {
    roadWrappers.value = []; // Reset refs when the list of cars changes
    // nextTick and setTimeout in the state watcher will handle animation start
  },
  { deep: true }
); // Watch deeply if carBets itself might be a reactive object whose internal properties change.
</script>

<style scoped>
.header-wrapper {
  display: flex;
  justify-content: center;
  flex-direction: row;
}

.road-wrapper {
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 10px auto;
  width: 100%;
  height: 50px;
  border: 1px solid #aaa;
  overflow: hidden;
}

.bet-road-part {
  height: 50px;
}

.car-icon {
  position: absolute;
  width: 50px; /* Keep a fixed width for the car icon initially */
  height: auto;
  left: 0;
  transform: translateX(-50px);
  z-index: 10;
}

/* Road styles unchanged */
.road-BUMPY {
  background: repeating-linear-gradient(
    45deg,
    #663300,
    #663300 10px,
    #4d2600 10px,
    #4d2600 20px
  );
}

.road-DIRT {
  background: linear-gradient(to right, #996633, #8c5c2d);
}

.road-HIGHWAY {
  background-color: #323232;
  background-image: linear-gradient(
    to right,
    transparent 45%,
    #ffffff33 50%,
    transparent 55%
  );
  background-size: 40px 100%;
}

.road-DESERT {
  background: linear-gradient(45deg, #edc9af, #f0d9b5);
}

.road-POTHOLES {
  background: radial-gradient(
    circle at 10% 20%,
    #3a3a3a 10%,
    #505050 30%,
    #3a3a3a 50%
  );
}

.road-EXPRESSWAY {
  background-color: #0064c8;
  background-image: linear-gradient(to right, #004a99 10%, #0064c8 90%);
}

.road-UNKNOWN {
  background: repeating-linear-gradient(
    135deg,
    #800080,
    #5c005c 20px,
    #800080 40px
  );
}
</style>
