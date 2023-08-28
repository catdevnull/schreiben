<script lang="ts">
  import { loadWorlds } from "../lib/worldStorage";
  import { routes } from "../lib/routes";
  import WorldLink from "../components/WorldLink.svelte";

  const worldsPromise = loadWorlds();
</script>

<header class="my-4 mx-8">
  <h1 class="font-bold text-3xl">Buen día.</h1>
  <h3>Elegí un mundo.</h3>
</header>

{#await worldsPromise then worlds}
  <ul class="m-4">
    {#each worlds as world}
      <li>
        <WorldLink
          className="px-6 py-4 bg-slate-200 w-full block rounded-2xl my-4 shadow text-xl"
          {world}
        />
      </li>
    {/each}
    <li>
      <a
        class="px-6 py-4 bg-slate-200 w-full block rounded-2xl my-4 shadow text-xl"
        href={routes.CreateWorld}>Crear mundo</a
      >
    </li>
  </ul>
{/await}
