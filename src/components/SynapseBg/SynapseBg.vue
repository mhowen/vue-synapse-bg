<template>
  <div
    class="sbg-root"
    :class="{ viewport: props.viewport === true }"
    ref="sbg_root"
  >
    <h2>Gang Shit Only</h2>

    <canvas class="sbg-canvas sbg-canvas__network" :class="{ viewport: props.viewport === true }" ref="cnv_network"></canvas>
    <canvas class="sbg-canvas sbg-canvas__signal" :class="{ viewport: props.viewport === true }" ref="cnv_signal"></canvas>
  </div>
</template>

<script setup lang="ts">
import SynapseBg from './SynapseBg';
import { ref, onMounted } from 'vue';

const props = defineProps({
  color: String,
  tracerScale: Number,
  viewport: Boolean,
});

const sbg_root = ref<HTMLDivElement | null>(null);
const cnv_network = ref<HTMLCanvasElement | null>(null);
const cnv_signal = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  // get refs to elements that will need to be directly manipulated in the DOM
  const root = sbg_root.value;
  const rootParent = root?.parentElement;
  const networkLayer = cnv_network.value;
  const signalLayer = cnv_signal.value;
  if (!rootParent || !networkLayer || !signalLayer) throw Error;

  new SynapseBg(root, networkLayer, signalLayer, props);
});
</script>

<style scoped>
.sbg-root,
.sbg-canvas {
  position: absolute;
  inset: 0;
}
.sbg-root.viewport {
  position: fixed;
  z-index: -999;
}
.sbg-canvas {
  z-index: inherit;
}
</style>
