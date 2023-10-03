<script setup lang="ts">
import SynapseBg from './components/SynapseBg/SynapseBg.vue'
</script>

<template>
  <div class="testDiv">
    <SynapseBg
      color="hotpink"
      :network-size="10"
      :speed-scale="2"
      :tracer-scale="5"
      viewport
    />
  </div>
</template>

<style scoped>
.testDiv {
  min-width: 600px;
  aspect-ratio: 1;

  outline: 5px solid rgb(106 90 205 / .5);
}

header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
