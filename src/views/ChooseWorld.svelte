<script lang="ts">
  import { loadWorlds } from "../lib/worldStorage";
  import { routes } from "../lib/routes";
  import WorldLink from "../components/WorldLink.svelte";

  const worldsPromise = loadWorlds();
</script>

<header class="mx-8 my-4">
  <h1 class="text-3xl font-bold">Buen día.</h1>
  <h3>Elegí un mundo.</h3>
</header>

{#await worldsPromise then worlds}
  <ul class="m-4">
    {#each worlds as world}
      <li>
        <WorldLink
          className="px-6 py-4 bg-slate-200 dark:bg-neutral-800 w-full block rounded-2xl dark:border-neutral-700/70 border my-4 shadow text-xl"
          {world}
        />
      </li>
    {/each}
    <li>
      <a
        class="my-4 block w-full rounded-2xl border bg-slate-200 px-6 py-4 text-xl shadow dark:border-neutral-700/70 dark:bg-neutral-800"
        href={routes.CreateWorld}>Crear mundo</a
      >
    </li>
  </ul>
{/await}

<div class="prose prose-neutral mx-auto my-8 px-4 dark:prose-invert">
  <h2>Schreiben es una aplicación para escribir.</h2>
  <p>
    Es un experimento para probar tecnologías de CRDT (actualmente <a
      href="https://github.com/yjs/yjs"
      rel="noreferrer noopener">Yjs</a
    >
    aunque también podría ser
    <a href="https://automerge.org/" rel="noreferrer noopener">Automerge</a>) e
    intentar crear con ellas un <em>knowledge base</em>.
  </p>
  <p>
    Schreiben está en desarrollo constante, y no recomiendo que almacenes nada
    de importancia acá.
  </p>
  <p>
    Schreiben está desarrollado por <a
      href="https://nulo.ar"
      rel="noreferrer noopener">Nulo</a
    >
    en su tiempo libre, y podés encontrar el código
    <a href="https://gitea.nulo.in/Nulo/schreiben" rel="noreferrer noopener"
      >en mi Gitea</a
    > :)
  </p>
</div>
