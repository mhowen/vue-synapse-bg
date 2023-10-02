<template>
  <div
    ref="sbg_root"
    class="sbg-root"
    :class="{ viewport: props.viewport === true }"
  >
    <canvas
      ref="cnv_network"
      class="sbg-canvas sbg-canvas__network"
      :class="{ viewport: props.viewport === true }"
    />
    <canvas
      ref="cnv_signal"
      class="sbg-canvas sbg-canvas__signal"
      :class="{ viewport: props.viewport === true }"
    />
  </div>
</template>

<script setup lang="ts">
import SynapseBg from './SynapseBg';
import { ref, onMounted } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: 'black'
  },
  tracerScale: {
    type: Number,
    default: 1
  },
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
