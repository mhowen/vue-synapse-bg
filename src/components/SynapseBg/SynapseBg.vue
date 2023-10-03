<template>
  <div
    ref="sbg_root"
    class="sbg-root"
    :class="{ 'sbg-root__viewport': props.viewport }"
  >
    <canvas
      ref="cnv_network"
      class="sbg-canvas"
    />
    <canvas
      ref="cnv_signal"
      class="sbg-canvas"
    />
  </div>
</template>

<script setup lang="ts">
import SynapseBg from './SynapseBg';
import { ref, onMounted } from 'vue';

// some number-type props allow strings for the sake of ergonomic templating; those are cast to numbers on mount
const props = defineProps({
  color: {
    type: String,
    default: 'black'
  },
  networkSize: {
    type: [String, Number],
    default: 5
  },
  speedScale: {
    type: [String, Number],
    default: 1
  },
  tracerScale: {
    type: [String, Number],
    default: 1
  },
  viewport: Boolean,
});

const sbg_root = ref<HTMLDivElement | null>(null);
const cnv_network = ref<HTMLCanvasElement | null>(null);
const cnv_signal = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  // get refs to elements that will need to be directly manipulated in the DOM
  const root = sbg_root.value; // container wrapping the two canvases
  const rootParent = root?.parentElement; // container wrapping root div, if such a thing exists
  const networkLayer = cnv_network.value; // the layer onto which static elements are rendered once
  const signalLayer = cnv_signal.value; // the layer onto which animated elements are rendered each cycle
  
  if (!rootParent || !networkLayer || !signalLayer) throw new Error;

  // if user passed a string, convert it to number. if user passed number, send it right through
  const checkInt = (val: string | number) => typeof val === 'string' ? parseInt(val) : val;

  const options = {
    color: props.color,
    networkSize: checkInt(props.networkSize),
    speedScale: checkInt(props.speedScale),
    tracerScale: checkInt(props.tracerScale),
    viewport: props.viewport
  }

  new SynapseBg(root, networkLayer, signalLayer, options);
});
</script>

<style scoped>
.sbg-root,
.sbg-canvas {
  overflow: hidden;
  position: absolute;
}
.sbg-root__viewport,
.sbg-root__viewport > .sbg-canvas {
  position: fixed;
  inset: 0;
  z-index: -999;
}
</style>
