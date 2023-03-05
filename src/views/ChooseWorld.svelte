<script lang="ts">
  import { inject } from "regexparam";
  import { loadWorlds } from "../lib/worldStorage";
  import { routes } from "../lib/routes";

  const worldsPromise = loadWorlds();
</script>

<h1>Buen día.</h1>
<h3>Elegí un mundo.</h3>

{#await worldsPromise then worlds}
  <ul>
    {#each worlds as world}
      <li>
        <a
          href={inject(routes.Page, {
            worldId: world.room,
            pageId: "index",
          })}>{world.room}</a
        >
      </li>
    {/each}
    <li><a href={routes.CreateWorld}>Crear mundo</a></li>
  </ul>
{/await}
