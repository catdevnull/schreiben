<script lang="ts">
  import { setRouteToLastPagePromise, currentRoute } from "./lib/router";
</script>

<main class="min-h-screen max-w-7xl mx-auto">
  {#await setRouteToLastPagePromise then}
    <svelte:component
      this={$currentRoute.component}
      {...$currentRoute.params}
    />
  {/await}
</main>
