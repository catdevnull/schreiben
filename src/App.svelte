<script lang="ts">
  import { setRouteToLastPagePromise, currentRoute } from "./lib/router";
</script>

<main>
  {#await setRouteToLastPagePromise then}
    <svelte:component
      this={$currentRoute.component}
      {...$currentRoute.params}
    />
  {/await}
</main>

<style>
  main {
    max-width: 1280px;
    margin: 0 auto;
  }
</style>
