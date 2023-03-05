<script lang="ts">
  import type { XmlFragment } from "yjs";
  import { inject } from "regexparam";
  import Editor from "../editor/Editor.svelte";
  import { getWorldPage, getWorldY, type WorldY } from "../lib/doc";
  import { routes } from "../lib/routes";
  import { loadWorlds } from "../lib/worldStorage";

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

  $: docPromise = loadDoc(worldId, pageId);
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
{#await docPromise then doc}
  <Editor doc={doc.doc} worldY={doc.worldY} />
{:catch error}
  {error}
  <a href={routes.ChooseWorld}>Volver al inicio</a>
{/await}

<style>
  nav a {
    color: inherit;
  }
</style>
