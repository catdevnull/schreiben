<script lang="ts">
  import type { XmlFragment } from "yjs";
  import { inject } from "regexparam";
  import Editor from "../editor/Editor.svelte";
  import { getWorldPage, getWorldY, type WorldY } from "../lib/doc";
  import { routes } from "../lib/routes";
  import { loadWorlds } from "../lib/worldStorage";
  import { lastPageStore } from "../lib/router";

  export let worldId: string;
  export let pageId: string;

  async function loadDoc(
    worldId: string,
    pageId: string
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

  async function saveLastPage() {
    await lastPageStore.set({ worldId, pageId });
  }
  saveLastPage();
</script>

<nav>
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
</nav>

{#if state === "loading"}Cargando...{:else if "doc" in state}
  <Editor doc={state.doc} worldY={state.worldY} />
{:else if "error" in state}
  {state.error}
  <a href={routes.ChooseWorld}>Volver al inicio</a>
{/if}

<style>
  nav a {
    color: inherit;
  }
</style>
