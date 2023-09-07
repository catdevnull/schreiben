<script lang="ts">
  import type { XmlFragment } from "yjs";
  import { inject } from "regexparam";
  import ArrowBackIcon from "eva-icons/fill/svg/arrow-back.svg";
  import Editor from "../editor/Editor.svelte";
  import Breadcrumbs from "./Page/Breadcrumbs.svelte";
  import { getWorldPage, getWorldY, type WorldY } from "../lib/doc";
  import { routes } from "../lib/routes";
  import { loadWorlds } from "../lib/worldStorage";

  export let worldId: string;
  export let pageId: string;

  async function loadDoc(
    worldId: string,
    pageId: string,
  ): Promise<{ worldY: WorldY; doc: XmlFragment }> {
    const worlds = await loadWorlds();
    const worldIdentifier = worlds.find((w) => w.room === worldId);
    if (!worldIdentifier) {
      throw new Error("No conozco ese mundo.");
    }
    const worldY = getWorldY(worldIdentifier);

    return { worldY, doc: getWorldPage(worldY.ydoc, pageId) };
  }

  let state: "loading" | { worldY: WorldY; doc: XmlFragment } | { error: any };
  $: {
    state = "loading";
    loadDoc(worldId, pageId)
      .then((doc) => {
        state = doc;
      })
      .catch((error) => (state = { error }));
  }

  function pop() {
    history.back();
  }
</script>

<div class="px-4">
  <details>
    <summary>Opciones</summary>
    <ul>
      <li><a href={routes.ChooseWorld}>🠔 Elegir otro mundo</a></li>
      <li>
        <a href={inject(routes.ShareWorld, { worldId })}
          >📱 Agregar mundo a otro dispositivo</a
        >
      </li>
    </ul>
  </details>
</div>
<nav
  class="sticky top-0 z-10 flex h-10 items-stretch gap-4 bg-white text-neutral-700 shadow dark:bg-neutral-800 dark:text-neutral-200"
>
  <button title="Ir a la página anterior" on:click={pop}>
    <ArrowBackIcon class="w-10 shrink-0 fill-current pl-2" />
  </button>
  <Breadcrumbs {pageId} {worldId} />
</nav>

{#if state === "loading"}Cargando...{:else if "doc" in state}
  <Editor doc={state.doc} worldY={state.worldY} />
{:else if "error" in state}
  {state.error}
  <a href={routes.ChooseWorld}>Volver al inicio</a>
{/if}
