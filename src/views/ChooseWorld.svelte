<script lang="ts">
  import { inject } from "regexparam";
  import { loadWorlds } from "../lib/worldStorage";
  import { routes } from "../lib/routes";
  import WorldLink from "../components/WorldLink.svelte";

  const worldsPromise = loadWorlds();
</script>

<h1>Buen día.</h1>
<h3>Elegí un mundo.</h3>

{#await worldsPromise then worlds}
  <ul>
    {#each worlds as world}
      <li>
        <WorldLink {world} />
      </li>
    {/each}
    <li><a href={routes.CreateWorld}>Crear mundo</a></li>
  </ul>
{/await}

<style>
  ul :global(a) {
    padding: 1em;
    display: block;
    background: #eee;
    margin: 0.5em;
    border-radius: 15px;
  }
</style>
