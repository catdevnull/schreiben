<script lang="ts">
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
          href={routes.Page.replace(":worldId", world.room).replace(
            ":pageId",
            "index"
          )}>{world.room}</a
        >
      </li>
    {/each}
    <li><a href={routes.CreateWorld}>Crear mundo</a></li>
  </ul>
{/await}
