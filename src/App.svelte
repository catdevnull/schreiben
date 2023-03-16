<script lang="ts">
  import { currentRoute } from "./lib/routes";
</script>

<main>
  <svelte:component this={$currentRoute.component} {...$currentRoute.params} />
</main>

<style>
  main {
    max-width: 1280px;
    margin: 0 auto;
  }
</style>
